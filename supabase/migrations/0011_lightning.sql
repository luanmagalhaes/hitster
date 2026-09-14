alter table vt_rooms add column if not exists mode text not null default 'CLASSIC';
alter table vt_rooms add column if not exists steal_count smallint not null default 0;
alter table vt_rooms drop constraint if exists vt_rooms_mode_check;
alter table vt_rooms add constraint vt_rooms_mode_check check (mode in ('CLASSIC', 'LIGHTNING'));
