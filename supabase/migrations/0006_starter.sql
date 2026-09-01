alter table vt_rooms add column if not exists starter_player_id uuid references vt_players (id) on delete set null;
