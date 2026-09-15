begin;

create or replace function public.meowdoku_get_progress()
returns table (
    unlocked_level smallint,
    completed_levels jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid := auth.uid();
begin
    if current_user_id is null then
        raise exception 'Authentication required';
    end if;

    return query
    select
        least(
            60,
            greatest(
                1,
                coalesce(max(l.level_number) filter (where p.status in ('unlocked', 'in_progress', 'completed')), 1),
                coalesce(max(l.level_number + 1) filter (where p.status = 'completed'), 1)
            )
        )::smallint,
        coalesce(
            jsonb_object_agg(
                l.level_number::text,
                jsonb_build_object(
                    'time', coalesce(p.best_time_seconds, 0),
                    'lives', greatest(0, 3 - coalesce(p.best_mistakes, 0)),
                    'score', p.best_score,
                    'stars', p.stars
                )
            ) filter (where p.status = 'completed'),
            '{}'::jsonb
        )
    from public.meowdoku_progress p
    join public.meowdoku_levels l on l.id = p.level_id
    where p.user_id = current_user_id;
end;
$$;

create or replace function public.meowdoku_complete_level(
    p_level_number smallint,
    p_score integer default 0,
    p_mistakes integer default 0,
    p_time_seconds integer default 0
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid := auth.uid();
    current_level_id uuid;
    next_level_id uuid;
    completion_time timestamptz := now();
begin
    if current_user_id is null then
        raise exception 'Authentication required';
    end if;

    if p_level_number < 1 or p_level_number > 60 then
        raise exception 'Invalid level number';
    end if;

    select id into current_level_id
    from public.meowdoku_levels
    where level_number = p_level_number;

    if current_level_id is null then
        raise exception 'Level not found';
    end if;

    if p_level_number > 1 and not exists (
        select 1
        from public.meowdoku_progress previous_progress
        join public.meowdoku_levels previous_level
          on previous_level.id = previous_progress.level_id
        where previous_progress.user_id = current_user_id
          and previous_level.level_number = p_level_number - 1
          and previous_progress.status = 'completed'
    ) then
        raise exception 'Previous level must be completed first';
    end if;

    insert into public.meowdoku_progress (
        user_id,
        level_id,
        status,
        best_score,
        best_mistakes,
        best_time_seconds,
        stars,
        attempt_count,
        unlocked_at,
        first_completed_at,
        last_completed_at
    ) values (
        current_user_id,
        current_level_id,
        'completed',
        greatest(0, p_score),
        greatest(0, p_mistakes),
        greatest(0, p_time_seconds),
        case
            when p_mistakes = 0 then 3
            when p_mistakes = 1 then 2
            else 1
        end,
        1,
        completion_time,
        completion_time,
        completion_time
    )
    on conflict (user_id, level_id) do update
    set status = 'completed',
        best_score = greatest(public.meowdoku_progress.best_score, excluded.best_score),
        best_mistakes = case
            when public.meowdoku_progress.best_mistakes is null then excluded.best_mistakes
            else least(public.meowdoku_progress.best_mistakes, excluded.best_mistakes)
        end,
        best_time_seconds = case
            when public.meowdoku_progress.best_time_seconds is null then excluded.best_time_seconds
            when excluded.best_time_seconds = 0 then public.meowdoku_progress.best_time_seconds
            else least(public.meowdoku_progress.best_time_seconds, excluded.best_time_seconds)
        end,
        stars = greatest(public.meowdoku_progress.stars, excluded.stars),
        attempt_count = public.meowdoku_progress.attempt_count + 1,
        unlocked_at = coalesce(public.meowdoku_progress.unlocked_at, completion_time),
        first_completed_at = coalesce(public.meowdoku_progress.first_completed_at, completion_time),
        last_completed_at = completion_time;

    if p_level_number < 60 then
        select id into next_level_id
        from public.meowdoku_levels
        where level_number = p_level_number + 1;

        insert into public.meowdoku_progress (
            user_id,
            level_id,
            status,
            unlocked_at
        ) values (
            current_user_id,
            next_level_id,
            'unlocked',
            completion_time
        )
        on conflict (user_id, level_id) do update
        set status = case
                when public.meowdoku_progress.status = 'locked' then 'unlocked'
                else public.meowdoku_progress.status
            end,
            unlocked_at = coalesce(public.meowdoku_progress.unlocked_at, completion_time);
    end if;
end;
$$;

revoke all on function public.meowdoku_get_progress() from public, anon;
grant execute on function public.meowdoku_get_progress() to authenticated;

revoke all on function public.meowdoku_complete_level(smallint, integer, integer, integer) from public, anon;
grant execute on function public.meowdoku_complete_level(smallint, integer, integer, integer) to authenticated;

commit;

select
    routine_name,
    security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('meowdoku_get_progress', 'meowdoku_complete_level')
order by routine_name;
