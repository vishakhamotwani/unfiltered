-- Run this in the Supabase SQL editor

create table if not exists usage_counter (
  id integer primary key default 1,
  count integer not null default 0,
  constraint single_row check (id = 1)
);

insert into usage_counter (id, count)
values (1, 0)
on conflict (id) do nothing;

create or replace function increment_counter()
returns void
language sql
security definer
as $$
  update usage_counter set count = count + 1 where id = 1;
$$;
