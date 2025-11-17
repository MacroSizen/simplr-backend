-- Create profiles table (references auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Create expenses table
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  amount decimal(10, 2) not null,
  description text,
  date timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

alter table public.expenses enable row level security;

create policy "expenses_select_own"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "expenses_insert_own"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "expenses_update_own"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "expenses_delete_own"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- Create reminder lists table
create table if not exists public.reminder_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default now()
);

alter table public.reminder_lists enable row level security;

create policy "reminder_lists_select_own"
  on public.reminder_lists for select
  using (auth.uid() = user_id);

create policy "reminder_lists_insert_own"
  on public.reminder_lists for insert
  with check (auth.uid() = user_id);

create policy "reminder_lists_update_own"
  on public.reminder_lists for update
  using (auth.uid() = user_id);

create policy "reminder_lists_delete_own"
  on public.reminder_lists for delete
  using (auth.uid() = user_id);

-- Create reminders table
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.reminder_lists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_date timestamp with time zone,
  relevance integer default 1,
  completed boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.reminders enable row level security;

create policy "reminders_select_own"
  on public.reminders for select
  using (auth.uid() = user_id);

create policy "reminders_insert_own"
  on public.reminders for insert
  with check (auth.uid() = user_id);

create policy "reminders_update_own"
  on public.reminders for update
  using (auth.uid() = user_id);

create policy "reminders_delete_own"
  on public.reminders for delete
  using (auth.uid() = user_id);

-- Create habits table
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  frequency text not null default 'daily',
  created_at timestamp with time zone default now()
);

alter table public.habits enable row level security;

create policy "habits_select_own"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "habits_insert_own"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "habits_update_own"
  on public.habits for update
  using (auth.uid() = user_id);

create policy "habits_delete_own"
  on public.habits for delete
  using (auth.uid() = user_id);

-- Create habit logs table
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  completed boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.habit_logs enable row level security;

create policy "habit_logs_select_own"
  on public.habit_logs for select
  using (auth.uid() = user_id);

create policy "habit_logs_insert_own"
  on public.habit_logs for insert
  with check (auth.uid() = user_id);

create policy "habit_logs_update_own"
  on public.habit_logs for update
  using (auth.uid() = user_id);

create policy "habit_logs_delete_own"
  on public.habit_logs for delete
  using (auth.uid() = user_id);

-- Create notes table
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.notes enable row level security;

create policy "notes_select_own"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "notes_insert_own"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "notes_update_own"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "notes_delete_own"
  on public.notes for delete
  using (auth.uid() = user_id);

-- Create profile trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
