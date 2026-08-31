alter table vt_rooms
  drop constraint if exists vt_rooms_difficulty_check;

update vt_rooms set difficulty = 'CLASSIC' where difficulty = 'EASY';
update vt_rooms set difficulty = 'QUICK' where difficulty = 'NORMAL';
update vt_rooms set difficulty = 'MARATHON' where difficulty = 'HARD';

alter table vt_rooms
  alter column difficulty set default 'CLASSIC',
  alter column seed_cards set default 1;

alter table vt_rooms
  add constraint vt_rooms_difficulty_check
  check (difficulty in ('CLASSIC', 'QUICK', 'MARATHON'));
