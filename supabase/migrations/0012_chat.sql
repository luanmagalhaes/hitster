create table if not exists vt_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references vt_rooms (id) on delete cascade,
  player_id uuid references vt_players (id) on delete set null,
  author_name text not null,
  kind text not null default 'TEXT',
  body text,
  audio_path text,
  audio_seconds smallint,
  created_at timestamp with time zone not null default now()
);

create index if not exists vt_messages_room_idx on vt_messages (room_id, created_at desc);

alter table vt_messages add constraint vt_messages_kind_check check (kind in ('TEXT', 'AUDIO'));
alter table vt_messages add constraint vt_messages_body_check
  check ((kind = 'TEXT' and body is not null) or (kind = 'AUDIO' and audio_path is not null));

alter table vt_messages enable row level security;
