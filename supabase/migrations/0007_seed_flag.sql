alter table vt_timeline_cards add column if not exists is_seed boolean not null default false;

update vt_timeline_cards c
set is_seed = true
where c.id in (
  select distinct on (player_id) id
  from vt_timeline_cards
  order by player_id, placed_at
);
