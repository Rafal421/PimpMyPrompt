-- Table for CompareAI sessions
-- Stores user questions sent to ALL providers simultaneously
create table if not exists public.compare_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for individual compare responses
-- Stores responses from each provider for a compare session
create table if not exists public.compare_responses (
  id uuid primary key default gen_random_uuid(),
  compare_session_id uuid not null references public.compare_sessions(id) on delete cascade,
  question text not null,
  responses_data jsonb not null, -- Stores array of { provider, model, response, error? }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.compare_sessions enable row level security;
alter table public.compare_responses enable row level security;

-- Policies for compare_sessions
create policy "Users can view their own compare sessions" on public.compare_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own compare sessions" on public.compare_sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own compare sessions" on public.compare_sessions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own compare sessions" on public.compare_sessions
  for delete using (auth.uid() = user_id);

-- Policies for compare_responses
create policy "Users can view responses from their sessions" on public.compare_responses
  for select using (
    exists (
      select 1 from public.compare_sessions
      where id = compare_responses.compare_session_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert responses to their sessions" on public.compare_responses
  for insert with check (
    exists (
      select 1 from public.compare_sessions
      where id = compare_responses.compare_session_id
      and user_id = auth.uid()
    )
  );

create policy "Users can delete responses from their sessions" on public.compare_responses
  for delete using (
    exists (
      select 1 from public.compare_sessions
      where id = compare_responses.compare_session_id
      and user_id = auth.uid()
    )
  );

-- Add indexes for faster queries
create index if not exists compare_sessions_user_id_idx on public.compare_sessions(user_id);
create index if not exists compare_sessions_created_at_idx on public.compare_sessions(created_at desc);
create index if not exists compare_responses_session_id_idx on public.compare_responses(compare_session_id);
create index if not exists compare_responses_created_at_idx on public.compare_responses(created_at desc);

-- Update chats table to support chat mode if not exists
alter table public.chats add column if not exists mode text check (mode in ('PMP', 'CHAT', 'COMPARE')) default 'PMP';
