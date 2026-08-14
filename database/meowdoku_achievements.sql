begin;

create schema if not exists private;

create table if not exists public.meowdoku_achievements (
    achievement_key text primary key,
    title text not null,
    description text not null,
    category text not null,
    target integer not null check (target > 0),
    icon_index smallint not null unique check (icon_index between 0 and 19),
    sort_order smallint not null unique,
    created_at timestamptz not null default now()
);

create table if not exists public.meowdoku_user_achievements (
    user_id uuid not null references auth.users(id) on delete cascade,
    achievement_key text not null references public.meowdoku_achievements(achievement_key) on delete cascade,
    unlocked_at timestamptz not null default now(),
    primary key (user_id, achievement_key)
);

create table if not exists public.meowdoku_cat_discoveries (
    user_id uuid not null references auth.users(id) on delete cascade,
    level_id uuid not null references public.meowdoku_levels(id) on delete cascade,
    cat_index smallint not null check (cat_index >= 0),
    discovered_at timestamptz not null default now(),
    primary key (user_id, level_id, cat_index)
);

create table if not exists public.meowdoku_level_performance (
    user_id uuid not null references auth.users(id) on delete cascade,
    level_id uuid not null references public.meowdoku_levels(id) on delete cascade,
    mistakes integer not null check (mistakes >= 0),
    hints_used integer not null check (hints_used >= 0),
    lives_remaining smallint not null check (lives_remaining between 0 and 3),
    completed_at timestamptz not null default now(),
    primary key (user_id, level_id)
);

create index if not exists meowdoku_user_achievements_user_idx
on public.meowdoku_user_achievements (user_id, unlocked_at desc);

create index if not exists meowdoku_cat_discoveries_user_idx
on public.meowdoku_cat_discoveries (user_id, discovered_at desc);

create index if not exists meowdoku_level_performance_user_idx
on public.meowdoku_level_performance (user_id, completed_at desc);

insert into public.meowdoku_achievements (
    achievement_key, title, description, category, target, icon_index, sort_order
)
values
    ('first_checkin', 'First Paw', 'Complete your first daily check-in.', 'Daily', 1, 0, 1),
    ('perfect_week', 'Weekly Whiskers', 'Check in on all seven days of the same week.', 'Daily', 1, 1, 2),
    ('checkin_7', 'Loyal Cat', 'Complete 7 daily check-ins.', 'Daily', 7, 2, 3),
    ('checkin_30', 'Cozy Companion', 'Complete 30 daily check-ins.', 'Daily', 30, 3, 4),
    ('first_cat', 'First Discovery', 'Find your first correct cat.', 'Discovery', 1, 4, 5),
    ('level_10', 'Bronze Trail', 'Complete level 10.', 'Progress', 10, 5, 6),
    ('level_20', 'Silver Trail', 'Complete level 20.', 'Progress', 20, 6, 7),
    ('level_30', 'Golden Trail', 'Complete level 30.', 'Progress', 30, 7, 8),
    ('level_50', 'Summit Cat', 'Complete level 50.', 'Progress', 50, 8, 9),
    ('level_60', 'Meowdoku Master', 'Complete all 60 levels.', 'Progress', 60, 9, 10),
    ('perfect_1', 'Perfect Paws', 'Complete one level without a wrong guess.', 'Accuracy', 1, 10, 11),
    ('perfect_5', 'Flawless Five', 'Complete 5 levels without a wrong guess.', 'Accuracy', 5, 11, 12),
    ('perfect_20', 'Perfect Detective', 'Complete 20 levels without a wrong guess.', 'Accuracy', 20, 12, 13),
    ('no_hint_10', 'Quiet Lantern', 'Complete 10 levels without using a hint.', 'Logic', 10, 13, 14),
    ('no_hint_20', 'Independent Mind', 'Complete 20 levels without using a hint.', 'Logic', 20, 14, 15),
    ('no_hint_50', 'Wise Whiskers', 'Complete 50 levels without using a hint.', 'Logic', 50, 15, 16),
    ('no_hint_60', 'Pure Logic Master', 'Complete all 60 levels without using a hint.', 'Logic', 60, 16, 17),
    ('last_life', 'One Heart Hero', 'Complete a level with exactly one life remaining.', 'Courage', 1, 17, 18),
    ('cats_25', 'Cat Collector', 'Find 25 correct cats.', 'Discovery', 25, 18, 19),
    ('cats_100', 'Grand Cat Collector', 'Find 100 correct cats.', 'Discovery', 100, 19, 20)
on conflict (achievement_key) do update
set title = excluded.title,
    description = excluded.description,
    category = excluded.category,
    target = excluded.target,
    icon_index = excluded.icon_index,
    sort_order = excluded.sort_order;

alter table public.meowdoku_achievements enable row level security;
alter table public.meowdoku_user_achievements enable row level security;
alter table public.meowdoku_cat_discoveries enable row level security;
alter table public.meowdoku_level_performance enable row level security;

drop policy if exists "Authenticated users can read Meowdoku achievements" on public.meowdoku_achievements;
create policy "Authenticated users can read Meowdoku achievements"
on public.meowdoku_achievements for select to authenticated using (true);

drop policy if exists "Users can read their own Meowdoku achievements" on public.meowdoku_user_achievements;
create policy "Users can read their own Meowdoku achievements"
on public.meowdoku_user_achievements for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own Meowdoku cat discoveries" on public.meowdoku_cat_discoveries;
create policy "Users can read their own Meowdoku cat discoveries"
on public.meowdoku_cat_discoveries for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own Meowdoku performance" on public.meowdoku_level_performance;
create policy "Users can read their own Meowdoku performance"
on public.meowdoku_level_performance for select to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.meowdoku_achievements from public, anon, authenticated;
revoke all on table public.meowdoku_user_achievements from public, anon, authenticated;
revoke all on table public.meowdoku_cat_discoveries from public, anon, authenticated;
revoke all on table public.meowdoku_level_performance from public, anon, authenticated;
grant select on table public.meowdoku_achievements to authenticated;
grant select on table public.meowdoku_user_achievements to authenticated;
grant select on table public.meowdoku_cat_discoveries to authenticated;
grant select on table public.meowdoku_level_performance to authenticated;
grant all on table public.meowdoku_achievements to service_role;
grant all on table public.meowdoku_user_achievements to service_role;
grant all on table public.meowdoku_cat_discoveries to service_role;
grant all on table public.meowdoku_level_performance to service_role;

create or replace function private.meowdoku_evaluate_achievements(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    result jsonb;
begin
    with candidates(achievement_key) as (
        select 'first_checkin' where exists (
            select 1 from public.meowdoku_daily_checkins where user_id = p_user_id
        )
        union all select 'perfect_week' where exists (
            select 1 from public.meowdoku_daily_checkins
            where user_id = p_user_id group by week_start having count(*) = 7
        )
        union all select 'checkin_7' where (
            select count(*) from public.meowdoku_daily_checkins where user_id = p_user_id
        ) >= 7
        union all select 'checkin_30' where (
            select count(*) from public.meowdoku_daily_checkins where user_id = p_user_id
        ) >= 30
        union all select 'first_cat' where exists (
            select 1 from public.meowdoku_cat_discoveries where user_id = p_user_id
        )
        union all select 'level_10' where exists (
            select 1 from public.meowdoku_progress p join public.meowdoku_levels l on l.id = p.level_id
            where p.user_id = p_user_id and p.status = 'completed' and l.level_number = 10
        )
        union all select 'level_20' where exists (
            select 1 from public.meowdoku_progress p join public.meowdoku_levels l on l.id = p.level_id
            where p.user_id = p_user_id and p.status = 'completed' and l.level_number = 20
        )
        union all select 'level_30' where exists (
            select 1 from public.meowdoku_progress p join public.meowdoku_levels l on l.id = p.level_id
            where p.user_id = p_user_id and p.status = 'completed' and l.level_number = 30
        )
        union all select 'level_50' where exists (
            select 1 from public.meowdoku_progress p join public.meowdoku_levels l on l.id = p.level_id
            where p.user_id = p_user_id and p.status = 'completed' and l.level_number = 50
        )
        union all select 'level_60' where exists (
            select 1 from public.meowdoku_progress p join public.meowdoku_levels l on l.id = p.level_id
            where p.user_id = p_user_id and p.status = 'completed' and l.level_number = 60
        )
        union all select 'perfect_1' where (
            select count(*) from public.meowdoku_progress
            where user_id = p_user_id and status = 'completed' and best_mistakes = 0
        ) >= 1
        union all select 'perfect_5' where (
            select count(*) from public.meowdoku_progress
            where user_id = p_user_id and status = 'completed' and best_mistakes = 0
        ) >= 5
        union all select 'perfect_20' where (
            select count(*) from public.meowdoku_progress
            where user_id = p_user_id and status = 'completed' and best_mistakes = 0
        ) >= 20
        union all select 'no_hint_10' where (
            select count(*) from public.meowdoku_level_performance
            where user_id = p_user_id and hints_used = 0
        ) >= 10
        union all select 'no_hint_20' where (
            select count(*) from public.meowdoku_level_performance
            where user_id = p_user_id and hints_used = 0
        ) >= 20
        union all select 'no_hint_50' where (
            select count(*) from public.meowdoku_level_performance
            where user_id = p_user_id and hints_used = 0
        ) >= 50
        union all select 'no_hint_60' where (
            select count(*) from public.meowdoku_level_performance
            where user_id = p_user_id and hints_used = 0
        ) >= 60
        union all select 'last_life' where exists (
            select 1 from public.meowdoku_level_performance
            where user_id = p_user_id and lives_remaining = 1
        )
        union all select 'cats_25' where (
            select count(*) from public.meowdoku_cat_discoveries where user_id = p_user_id
        ) >= 25
        union all select 'cats_100' where (
            select count(*) from public.meowdoku_cat_discoveries where user_id = p_user_id
        ) >= 100
    ), inserted as (
        insert into public.meowdoku_user_achievements (user_id, achievement_key)
        select p_user_id, achievement_key from candidates
        on conflict (user_id, achievement_key) do nothing
        returning achievement_key, unlocked_at
    )
    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'key', a.achievement_key,
                'title', a.title,
                'description', a.description,
                'category', a.category,
                'target', a.target,
                'icon_index', a.icon_index,
                'unlocked_at', i.unlocked_at
            ) order by a.sort_order
        ),
        '[]'::jsonb
    ) into result
    from inserted i
    join public.meowdoku_achievements a on a.achievement_key = i.achievement_key;

    return result;
end;
$$;

revoke all on function private.meowdoku_evaluate_achievements(uuid) from public, anon, authenticated;

create or replace function public.meowdoku_get_achievements()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid := auth.uid();
    checkin_count integer;
    completed_count integer;
    perfect_count integer;
    no_hint_count integer;
    cat_count integer;
    has_perfect_week boolean;
    result jsonb;
begin
    if current_user_id is null then raise exception 'Authentication required'; end if;
    perform private.meowdoku_evaluate_achievements(current_user_id);

    select count(*) into checkin_count from public.meowdoku_daily_checkins where user_id = current_user_id;
    select count(*) into completed_count from public.meowdoku_progress where user_id = current_user_id and status = 'completed';
    select count(*) into perfect_count from public.meowdoku_progress where user_id = current_user_id and status = 'completed' and best_mistakes = 0;
    select count(*) into no_hint_count from public.meowdoku_level_performance where user_id = current_user_id and hints_used = 0;
    select count(*) into cat_count from public.meowdoku_cat_discoveries where user_id = current_user_id;
    select exists (
        select 1 from public.meowdoku_daily_checkins where user_id = current_user_id
        group by week_start having count(*) = 7
    ) into has_perfect_week;

    select jsonb_build_object(
        'unlocked_count', count(ua.achievement_key),
        'total_count', count(*),
        'achievements', jsonb_agg(
            jsonb_build_object(
                'key', a.achievement_key,
                'title', a.title,
                'description', a.description,
                'category', a.category,
                'target', a.target,
                'icon_index', a.icon_index,
                'progress', least(a.target, case
                    when a.achievement_key = 'first_checkin' then checkin_count
                    when a.achievement_key = 'perfect_week' then case when has_perfect_week then 1 else 0 end
                    when a.achievement_key in ('checkin_7', 'checkin_30') then checkin_count
                    when a.achievement_key = 'first_cat' then cat_count
                    when a.achievement_key in ('level_10', 'level_20', 'level_30', 'level_50', 'level_60') then completed_count
                    when a.achievement_key in ('perfect_1', 'perfect_5', 'perfect_20') then perfect_count
                    when a.achievement_key in ('no_hint_10', 'no_hint_20', 'no_hint_50', 'no_hint_60') then no_hint_count
                    when a.achievement_key = 'last_life' then case when exists (
                        select 1 from public.meowdoku_level_performance
                        where user_id = current_user_id and lives_remaining = 1
                    ) then 1 else 0 end
                    when a.achievement_key in ('cats_25', 'cats_100') then cat_count
                    else 0
                end),
                'unlocked', ua.achievement_key is not null,
                'unlocked_at', ua.unlocked_at
            ) order by a.sort_order
        )
    ) into result
    from public.meowdoku_achievements a
    left join public.meowdoku_user_achievements ua
      on ua.achievement_key = a.achievement_key and ua.user_id = current_user_id;

    return result;
end;
$$;

create or replace function public.meowdoku_record_cat_found(
    p_level_number smallint,
    p_cat_index smallint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid := auth.uid();
    current_level public.meowdoku_levels%rowtype;
begin
    if current_user_id is null then raise exception 'Authentication required'; end if;
    select * into current_level from public.meowdoku_levels where level_number = p_level_number;
    if current_level.id is null then raise exception 'Level not found'; end if;
    if p_cat_index < 0 or p_cat_index >= current_level.cat_count then raise exception 'Invalid cat index'; end if;

    insert into public.meowdoku_cat_discoveries (user_id, level_id, cat_index)
    values (current_user_id, current_level.id, p_cat_index)
    on conflict (user_id, level_id, cat_index) do nothing;

    return jsonb_build_object(
        'new_achievements', private.meowdoku_evaluate_achievements(current_user_id)
    );
end;
$$;

create or replace function public.meowdoku_complete_level_with_achievements(
    p_level_number smallint,
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
    current_level public.meowdoku_levels%rowtype;
begin
    if current_user_id is null then raise exception 'Authentication required'; end if;
    if p_lives_remaining < 1 or p_lives_remaining > 3 then raise exception 'Invalid lives remaining'; end if;
    if p_hints_used < 0 then raise exception 'Invalid hint count'; end if;

    perform public.meowdoku_complete_level(p_level_number, p_score, p_mistakes, p_time_seconds);
    select * into current_level from public.meowdoku_levels where level_number = p_level_number;

    insert into public.meowdoku_level_performance (
        user_id, level_id, mistakes, hints_used, lives_remaining
    ) values (
        current_user_id, current_level.id, greatest(0, p_mistakes), p_hints_used, p_lives_remaining
    )
    on conflict (user_id, level_id) do nothing;

    insert into public.meowdoku_cat_discoveries (user_id, level_id, cat_index)
    select current_user_id, current_level.id, index_value::smallint
    from generate_series(0, current_level.cat_count - 1) as index_value
    on conflict (user_id, level_id, cat_index) do nothing;

    return jsonb_build_object(
        'new_achievements', private.meowdoku_evaluate_achievements(current_user_id)
    );
end;
$$;

revoke all on function public.meowdoku_get_achievements() from public, anon;
revoke all on function public.meowdoku_record_cat_found(smallint, smallint) from public, anon;
revoke all on function public.meowdoku_complete_level_with_achievements(smallint, integer, integer, integer, integer, smallint) from public, anon;
grant execute on function public.meowdoku_get_achievements() to authenticated;
grant execute on function public.meowdoku_record_cat_found(smallint, smallint) to authenticated;
grant execute on function public.meowdoku_complete_level_with_achievements(smallint, integer, integer, integer, integer, smallint) to authenticated;

create or replace function public.meowdoku_claim_check_in()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid := auth.uid();
    local_today date := (now() at time zone 'Asia/Kuala_Lumpur')::date;
    current_day_index smallint := extract(isodow from (now() at time zone 'Asia/Kuala_Lumpur'))::smallint - 1;
    current_week_start date;
    rewards integer[] := array[5, 10, 15, 20, 25, 30, 50];
    current_reward integer;
    current_coins integer;
    claimed integer[];
    new_achievements jsonb;
begin
    if current_user_id is null then raise exception 'Authentication required'; end if;
    current_week_start := local_today - current_day_index;
    current_reward := rewards[current_day_index + 1];

    insert into public.meowdoku_daily_checkins (
        user_id, check_in_date, week_start, day_index, reward_coins
    ) values (
        current_user_id, local_today, current_week_start, current_day_index, current_reward
    );

    update public.inventory_pet
    set coins = coalesce(coins, 0) + current_reward, updated_at = now()
    where user_id = current_user_id
    returning coins into current_coins;

    if current_coins is null then raise exception 'Pet inventory not found'; end if;

    select coalesce(array_agg(day_index order by day_index), array[]::integer[])
    into claimed
    from public.meowdoku_daily_checkins
    where user_id = current_user_id and week_start = current_week_start;

    new_achievements := private.meowdoku_evaluate_achievements(current_user_id);

    return jsonb_build_object(
        'week_start', current_week_start,
        'today_index', current_day_index,
        'claimed_days', to_jsonb(claimed),
        'claimed_today', true,
        'reward_today', current_reward,
        'coins', current_coins,
        'new_achievements', new_achievements
    );
exception
    when unique_violation then raise exception 'Today''s check-in has already been claimed';
end;
$$;

revoke all on function public.meowdoku_claim_check_in() from public, anon;
grant execute on function public.meowdoku_claim_check_in() to authenticated;

commit;

select count(*) as achievement_count from public.meowdoku_achievements;

select routine_name, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
      'meowdoku_get_achievements',
      'meowdoku_record_cat_found',
      'meowdoku_complete_level_with_achievements',
      'meowdoku_claim_check_in'
  )
order by routine_name;
