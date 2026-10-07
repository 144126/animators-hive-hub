-- u user: i id, e email (lowercased), n username (unique, any case), d display name, b bio, a avatar url, l location, w website, p password hash, t created ms
create table u (
	i text primary key,
	e text not null unique,
	n text not null collate nocase unique,
	d text not null default '',
	b text not null default '',
	a text not null default '',
	l text not null default '',
	w text not null default '',
	p text not null,
	t integer not null
);

-- c community: i id, s slug, n name, d description, a avatar url, b banner url, m member count, u creator, t created ms
create table c (
	i text primary key,
	s text not null unique,
	n text not null,
	d text,
	a text,
	b text,
	m integer not null default 1,
	u text not null references u (i) on delete cascade,
	t integer not null
);

-- a animation: i id, u author, c community, ti title, d description, v video url, im thumbnail url, p upvotes, n comments, t created ms
create table a (
	i text primary key,
	u text not null references u (i) on delete cascade,
	c text references c (i) on delete set null,
	ti text not null,
	d text,
	v text,
	im text,
	p integer not null default 0,
	n integer not null default 0,
	t integer not null
);
create index a_t on a (t);
create index a_p on a (p, t);
create index a_u on a (u, t);
create index a_c on a (c, t);

-- v upvote: u user, a animation, t created ms
create table v (
	u text not null references u (i) on delete cascade,
	a text not null references a (i) on delete cascade,
	t integer not null,
	primary key (u, a)
) without rowid;
create index v_a on v (a);

-- n comment: i id, a animation, u author, x text, t created ms
create table n (
	i text primary key,
	a text not null references a (i) on delete cascade,
	u text not null references u (i) on delete cascade,
	x text not null,
	t integer not null
);
create index n_a on n (a, t);

-- l playlist: i id, u owner, n name, d description, t created ms
create table l (
	i text primary key,
	u text not null references u (i) on delete cascade,
	n text not null,
	d text,
	t integer not null
);
create index l_u on l (u, t);

-- li playlist item: i id, l playlist, a animation, t created ms
create table li (
	i text primary key,
	l text not null references l (i) on delete cascade,
	a text not null references a (i) on delete cascade,
	t integer not null,
	unique (l, a)
);
