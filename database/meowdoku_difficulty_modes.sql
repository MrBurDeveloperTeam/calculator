begin;

create table if not exists public.meowdoku_mode_progress (
    user_id uuid not null references auth.users(id) on delete cascade,
    level_id uuid not null references public.meowdoku_levels(id) on delete cascade,
    mode text not null check (mode in ('easy', 'medium', 'hard', 'hell')),
    best_score integer not null default 0 check (best_score >= 0),
    best_mistakes integer not null default 0 check (best_mistakes >= 0),
    best_time_seconds integer not null default 0 check (best_time_seconds >= 0),
    hints_used integer not null default 0 check (hints_used >= 0),
    lives_remaining smallint not null default 3 check (lives_remaining between 1 and 3),
    completed_at timestamptz not null default now(),
    primary key (user_id, level_id, mode)
);

create index if not exists meowdoku_mode_progress_user_completed_idx
on public.meowdoku_mode_progress (user_id, completed_at desc);

alter table public.meowdoku_mode_progress enable row level security;

drop policy if exists "Users can read their own Meowdoku mode progress" on public.meowdoku_mode_progress;
create policy "Users can read their own Meowdoku mode progress"
on public.meowdoku_mode_progress for select to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.meowdoku_mode_progress from public, anon, authenticated;
grant select on table public.meowdoku_mode_progress to authenticated;
grant all on table public.meowdoku_mode_progress to service_role;

-- Preserve existing players by treating every legacy completion as an Easy completion.
insert into public.meowdoku_mode_progress (
    user_id, level_id, mode, best_score, best_mistakes, best_time_seconds,
    hints_used, lives_remaining, completed_at
)
select
    p.user_id,
    p.level_id,
    'easy',
    greatest(0, coalesce(p.best_score, 0)),
    greatest(0, coalesce(p.best_mistakes, 0)),
    greatest(0, coalesce(p.best_time_seconds, 0)),
    0,
    greatest(1, least(3, 3 - coalesce(p.best_mistakes, 0)))::smallint,
    coalesce(p.first_completed_at, p.last_completed_at, now())
from public.meowdoku_progress p
where p.status = 'completed'
on conflict (user_id, level_id, mode) do nothing;

create or replace function public.meowdoku_get_mode_progress()
returns table (
    unlocked_level smallint,
    completed_modes jsonb
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
                coalesce(max(l.level_number + 1), 1)
            )
        )::smallint,
        coalesce(
            jsonb_object_agg(
                l.level_number::text || ':' || mp.mode,
                jsonb_build_object(
                    'time', mp.best_time_seconds,
                    'lives', mp.lives_remaining,
                    'score', mp.best_score,
                    'mistakes', mp.best_mistakes,
                    'hints', mp.hints_used,
                    'completed_at', mp.completed_at
                )
            ),
            '{}'::jsonb
        )
    from public.meowdoku_mode_progress mp
    join public.meowdoku_levels l on l.id = mp.level_id
    where mp.user_id = current_user_id;
end;
$$;

create or replace function public.meowdoku_complete_mode_with_achievements(
    p_level_number smallint,
    p_mode text,
    p_score integer default 0,
    p_mistakes integer default 0,
    p_time_seconds integer default 0,
    p_hints_used integer default 0,
    p_lives_remaining smallint default 3
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid := auth.uid();
    current_level_id uuid;
    normalized_mode text := lower(trim(p_mode));
    achievement_result jsonb;
begin
    if current_user_id is null then raise exception 'Authentication required'; end if;
    if p_level_number < 1 or p_level_number > 60 then raise exception 'Invalid level number'; end if;
    if normalized_mode not in ('easy', 'medium', 'hard', 'hell') then raise exception 'Invalid mode'; end if;
    if p_lives_remaining < 1 or p_lives_remaining > 3 then raise exception 'Invalid lives remaining'; end if;
    if p_hints_used < 0 then raise exception 'Invalid hint count'; end if;

    select id into current_level_id
    from public.meowdoku_levels
    where level_number = p_level_number;

    if current_level_id is null then raise exception 'Level not found'; end if;

    if p_level_number > 1 and not exists (
        select 1
        from public.meowdoku_mode_progress previous_mode
        join public.meowdoku_levels previous_level on previous_level.id = previous_mode.level_id
        where previous_mode.user_id = current_user_id
          and previous_level.level_number = p_level_number - 1
    ) then
        raise exception 'Previous level must be completed first';
    end if;

    insert into public.meowdoku_mode_progress (
        user_id, level_id, mode, best_score, best_mistakes,
        best_time_seconds, hints_used, lives_remaining
    ) values (
        current_user_id, current_level_id, normalized_mode,
        greatest(0, p_score), greatest(0, p_mistakes), greatest(0, p_time_seconds),
        p_hints_used, p_lives_remaining
    )
    on conflict (user_id, level_id, mode) do nothing;

    if not found then
        raise exception 'This level mode has already been completed';
    end if;

    achievement_result := public.meowdoku_complete_level_with_achievements(
        p_level_number, p_score, p_mistakes, p_time_seconds, p_hints_used, p_lives_remaining
    );

    return coalesce(achievement_result, '{}'::jsonb) || jsonb_build_object(
        'completed_level', p_level_number,
        'completed_mode', normalized_mode
    );
end;
$$;

revoke all on function public.meowdoku_get_mode_progress() from public, anon;
revoke all on function public.meowdoku_complete_mode_with_achievements(smallint, text, integer, integer, integer, integer, smallint) from public, anon;
grant execute on function public.meowdoku_get_mode_progress() to authenticated;
grant execute on function public.meowdoku_complete_mode_with_achievements(smallint, text, integer, integer, integer, integer, smallint) to authenticated;

commit;

select
    routine_name,
    security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('meowdoku_get_mode_progress', 'meowdoku_complete_mode_with_achievements')
order by routine_name;
