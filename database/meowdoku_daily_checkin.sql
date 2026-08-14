begin;

create table if not exists public.meowdoku_daily_checkins (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    check_in_date date not null,
    week_start date not null,
    day_index smallint not null check (day_index between 0 and 6),
    reward_coins integer not null check (reward_coins > 0),
    created_at timestamptz not null default now(),
    constraint meowdoku_daily_checkins_user_date_unique unique (user_id, check_in_date),
    constraint meowdoku_daily_checkins_week_check check (check_in_date = week_start + day_index)
);

create index if not exists meowdoku_daily_checkins_user_week_idx
on public.meowdoku_daily_checkins (user_id, week_start, check_in_date);

alter table public.meowdoku_daily_checkins enable row level security;

revoke all on table public.meowdoku_daily_checkins from public, anon, authenticated;
grant select on table public.meowdoku_daily_checkins to authenticated;
grant all on table public.meowdoku_daily_checkins to service_role;

drop policy if exists "Users can read their own Meowdoku check-ins" on public.meowdoku_daily_checkins;
create policy "Users can read their own Meowdoku check-ins"
on public.meowdoku_daily_checkins
for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.meowdoku_get_check_in()
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
    claimed integer[];
    current_coins integer;
    claimed_reward integer;
begin
    if current_user_id is null then
        raise exception 'Authentication required';
    end if;

    current_week_start := local_today - current_day_index;

    select coalesce(array_agg(day_index order by day_index), array[]::integer[])
    into claimed
    from public.meowdoku_daily_checkins
    where user_id = current_user_id
      and week_start = current_week_start;

    select coins into current_coins
    from public.inventory_pet
    where user_id = current_user_id;

    select reward_coins into claimed_reward
    from public.meowdoku_daily_checkins
    where user_id = current_user_id
      and check_in_date = local_today;

    return jsonb_build_object(
        'week_start', current_week_start,
        'today_index', current_day_index,
        'claimed_days', to_jsonb(claimed),
        'claimed_today', current_day_index = any(claimed),
        'reward_today', coalesce(claimed_reward, case when current_day_index = 6 then 0 else 5 end),
        'reward_min', 5,
        'reward_max', case when current_day_index = 6 then 100 else 5 end,
        'is_sunday', current_day_index = 6,
        'coins', coalesce(current_coins, 0)
    );
end;
$$;

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
    current_reward integer;
    reward_roll double precision;
    current_coins integer;
    claimed integer[];
begin
    if current_user_id is null then
        raise exception 'Authentication required';
    end if;

    current_week_start := local_today - current_day_index;
    if current_day_index < 6 then
        current_reward := 5;
    else
        -- Weighted Sunday wheel: larger prizes remain possible but become rarer.
        reward_roll := random();
        current_reward := case
            when reward_roll < 0.35 then 5
            when reward_roll < 0.60 then 10
            when reward_roll < 0.75 then 15
            when reward_roll < 0.85 then 20
            when reward_roll < 0.92 then 30
            when reward_roll < 0.97 then 50
            when reward_roll < 0.99 then 75
            else 100
        end;
    end if;

    insert into public.meowdoku_daily_checkins (
        user_id,
        check_in_date,
        week_start,
        day_index,
        reward_coins
    ) values (
        current_user_id,
        local_today,
        current_week_start,
        current_day_index,
        current_reward
    );

    update public.inventory_pet
    set coins = coalesce(coins, 0) + current_reward,
        updated_at = now()
    where user_id = current_user_id
    returning coins into current_coins;

    if current_coins is null then
        raise exception 'Pet inventory not found';
    end if;

    select coalesce(array_agg(day_index order by day_index), array[]::integer[])
    into claimed
    from public.meowdoku_daily_checkins
    where user_id = current_user_id
      and week_start = current_week_start;

    return jsonb_build_object(
        'week_start', current_week_start,
        'today_index', current_day_index,
        'claimed_days', to_jsonb(claimed),
        'claimed_today', true,
        'reward_today', current_reward,
        'reward_min', 5,
        'reward_max', case when current_day_index = 6 then 100 else 5 end,
        'is_sunday', current_day_index = 6,
        'coins', current_coins
    );
exception
    when unique_violation then
        raise exception 'Today''s check-in has already been claimed';
end;
$$;

revoke all on function public.meowdoku_get_check_in() from public, anon;
grant execute on function public.meowdoku_get_check_in() to authenticated;

revoke all on function public.meowdoku_claim_check_in() from public, anon;
grant execute on function public.meowdoku_claim_check_in() to authenticated;

commit;

select
    routine_name,
    security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('meowdoku_get_check_in', 'meowdoku_claim_check_in')
order by routine_name;
