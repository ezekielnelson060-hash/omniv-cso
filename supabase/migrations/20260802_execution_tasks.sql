-- Cloud-synced execution tasks (Ziki / release / opportunity)
create table if not exists public.execution_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  source text not null default 'manual',
  done boolean not null default false,
  due_date date,
  artist_id uuid,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists execution_tasks_user_idx
  on public.execution_tasks (user_id, done, created_at desc);

alter table public.execution_tasks enable row level security;

drop policy if exists "exec_tasks_select_own" on public.execution_tasks;
create policy "exec_tasks_select_own" on public.execution_tasks
  for select using (auth.uid() = user_id);

drop policy if exists "exec_tasks_insert_own" on public.execution_tasks;
create policy "exec_tasks_insert_own" on public.execution_tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "exec_tasks_update_own" on public.execution_tasks;
create policy "exec_tasks_update_own" on public.execution_tasks
  for update using (auth.uid() = user_id);

drop policy if exists "exec_tasks_delete_own" on public.execution_tasks;
create policy "exec_tasks_delete_own" on public.execution_tasks
  for delete using (auth.uid() = user_id);
