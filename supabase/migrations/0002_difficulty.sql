alter table vt_rooms
  add column if not exists difficulty text not null default 'NORMAL',
  add column if not exists seed_cards smallint not null default 3,
  add column if not exists token_cost smallint not null default 3;

alter table vt_rooms
  drop constraint if exists vt_rooms_difficulty_check;

alter table vt_rooms
  add constraint vt_rooms_difficulty_check
  check (difficulty in ('EASY', 'NORMAL', 'HARD'));
