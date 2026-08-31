create extension if not exists pgcrypto;

create table if not exists vt_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  phase text not null default 'LOBBY',
  deck text not null default 'MIXED',
  target_cards smallint not null default 10,
  host_player_id uuid,
  winner_player_id uuid,
  turn_player_id uuid,
  current_track_id text,
  current_started_at timestamptz,
  event_sequence integer not null default 0,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  constraint vt_rooms_phase_check check (phase in ('LOBBY', 'PLAYING', 'FINISHED')),
  constraint vt_rooms_deck_check check (deck in ('NATIONAL', 'INTERNATIONAL', 'MIXED')),
  constraint vt_rooms_code_format check (code ~ '^[A-Z0-9]{6}$')
);

create table if not exists vt_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references vt_rooms (id) on delete cascade,
  name text not null,
  seat smallint not null,
  is_host boolean not null default false,
  is_turntable boolean not null default false,
  tokens smallint not null default 2,
  timeline_count smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vt_players_seat_range check (seat between 1 and 10),
  constraint vt_players_name_length check (char_length(btrim(name)) between 1 and 24),
  unique (room_id, seat)
);

create unique index if not exists vt_players_room_name_key
  on vt_players (room_id, lower(btrim(name)));

create table if not exists vt_player_secrets (
  player_id uuid primary key references vt_players (id) on delete cascade,
  room_id uuid not null references vt_rooms (id) on delete cascade,
  access_token text not null unique
);

create table if not exists vt_draw_pile (
  room_id uuid not null references vt_rooms (id) on delete cascade,
  track_id text not null,
  position integer not null,
  primary key (room_id, track_id)
);

create index if not exists vt_draw_pile_order_idx on vt_draw_pile (room_id, position);

create table if not exists vt_timeline_cards (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references vt_rooms (id) on delete cascade,
  player_id uuid not null references vt_players (id) on delete cascade,
  track_id text not null,
  year smallint not null,
  placed_at timestamptz not null default now(),
  unique (room_id, track_id)
);

create index if not exists vt_timeline_player_idx on vt_timeline_cards (player_id, year);

create table if not exists vt_guesses (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references vt_rooms (id) on delete cascade,
  player_id uuid not null references vt_players (id) on delete cascade,
  track_id text not null,
  slot_index smallint not null,
  was_correct boolean not null,
  actual_year smallint not null,
  created_at timestamptz not null default now()
);

create table if not exists vt_events (
  id bigserial primary key,
  room_id uuid not null references vt_rooms (id) on delete cascade,
  sequence integer not null,
  type text not null,
  actor_id uuid references vt_players (id) on delete set null,
  track_id text,
  detail text,
  created_at timestamptz not null default now(),
  unique (room_id, sequence)
);

create index if not exists vt_events_feed_idx on vt_events (room_id, sequence desc);

create or replace function vt_next_sequence(p_room uuid)
returns integer
language sql
as $$
  update vt_rooms set event_sequence = event_sequence + 1
  where id = p_room
  returning event_sequence;
$$;

create or replace function vt_generate_code()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  attempt integer := 0;
begin
  loop
    candidate := '';

    for index in 1..6 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
    end loop;

    exit when not exists (select 1 from vt_rooms where code = candidate);

    attempt := attempt + 1;

    if attempt > 40 then
      raise exception 'nao foi possivel gerar codigo de sala';
    end if;
  end loop;

  return candidate;
end;
$$;

create or replace function vt_sync_counts(p_player uuid)
returns integer
language plpgsql
as $$
declare
  total integer;
begin
  select count(*) into total from vt_timeline_cards where player_id = p_player;

  update vt_players set timeline_count = total, updated_at = now() where id = p_player;

  return total;
end;
$$;

alter table vt_rooms enable row level security;
alter table vt_players enable row level security;
alter table vt_player_secrets enable row level security;
alter table vt_draw_pile enable row level security;
alter table vt_timeline_cards enable row level security;
alter table vt_guesses enable row level security;
alter table vt_events enable row level security;

drop policy if exists vt_rooms_read on vt_rooms;
create policy vt_rooms_read on vt_rooms for select to anon, authenticated using (true);

drop policy if exists vt_players_read on vt_players;
create policy vt_players_read on vt_players for select to anon, authenticated using (true);

drop policy if exists vt_timeline_read on vt_timeline_cards;
create policy vt_timeline_read on vt_timeline_cards for select to anon, authenticated using (true);

drop policy if exists vt_guesses_read on vt_guesses;
create policy vt_guesses_read on vt_guesses for select to anon, authenticated using (true);

drop policy if exists vt_events_read on vt_events;
create policy vt_events_read on vt_events for select to anon, authenticated using (true);

alter publication supabase_realtime add table vt_rooms;
alter publication supabase_realtime add table vt_players;
alter publication supabase_realtime add table vt_timeline_cards;
alter publication supabase_realtime add table vt_events;
