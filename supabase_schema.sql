-- Create Subjects Table
create table public.subjects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  color text not null
);

-- Create Topics Table
create table public.topics (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  last_reviewed timestamp with time zone default timezone('utc'::text, now()),
  interval_step smallint default 0,
  next_review timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.subjects enable row level security;
alter table public.topics enable row level security;

-- Create Policies (Allow everything for now since we don't have Auth yet)
create policy "Enable all access for all users" on public.subjects
for all using (true) with check (true);

create policy "Enable all access for all users" on public.topics
for all using (true) with check (true);
