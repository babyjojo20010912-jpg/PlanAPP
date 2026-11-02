-- 在 Supabase 项目的 SQL Editor 中执行一次，用于创建任务表与行级安全策略(RLS)。
-- 多设备同步按 user_id 隔离数据，每个登录用户只能读写自己的任务。

create table if not exists public.tasks (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  due_at timestamptz,
  color text not null default '#4DABF7',
  bg_color text,
  section text not null default 'schedule' check (section in ('schedule', 'longterm')),
  sort_order integer not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  tag_id text,
  title_marks text,
  parent_id text
);

-- 若表已存在（旧版本未包含 section / sort_order 列），补充迁移这些列
alter table public.tasks add column if not exists section text not null default 'schedule';
alter table public.tasks drop constraint if exists tasks_section_check;
alter table public.tasks add constraint tasks_section_check check (section in ('schedule', 'longterm'));
alter table public.tasks add column if not exists sort_order integer not null default 0;
alter table public.tasks add column if not exists tag_id text;
alter table public.tasks drop column if exists notes;
alter table public.tasks add column if not exists title_marks text;
alter table public.tasks add column if not exists parent_id text;
alter table public.tasks add column if not exists bg_color text;

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_updated_at_idx on public.tasks (updated_at);

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

-- 开启 Realtime，便于多设备实时同步变更
alter publication supabase_realtime add table public.tasks;
