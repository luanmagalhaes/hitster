alter table vt_rooms
  add column if not exists turn_started_at timestamptz,
  add column if not exists turn_seconds smallint not null default 60;

update vt_rooms set turn_started_at = now() where phase = 'PLAYING' and turn_started_at is null;
