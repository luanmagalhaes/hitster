alter table vt_rooms add column if not exists steal_player_id uuid references vt_players (id) on delete set null;
alter table vt_rooms add column if not exists steal_seconds smallint not null default 30;
alter table vt_rooms add column if not exists last_steal jsonb;
