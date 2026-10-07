-- cm community member: c community, u user, t joined ms
create table cm (
	c text not null references c (i) on delete cascade,
	u text not null references u (i) on delete cascade,
	t integer not null,
	primary key (c, u)
) without rowid;
create index cm_u on cm (u);
insert or ignore into cm (c, u, t) select i, u, t from c;
update c set m = (select count(*) from cm where cm.c = c.i);
