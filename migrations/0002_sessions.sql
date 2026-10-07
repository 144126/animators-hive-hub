-- s session: i sha-256 hex of the cookie token, u user, x expires ms, t created ms
create table s (
	i text primary key,
	u text not null references u (i) on delete cascade,
	x integer not null,
	t integer not null
);
create index s_u on s (u);
