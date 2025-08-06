create table public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.chats(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  "from" text check ("from" in ('user', 'bot')) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chats enable row level security;
alter table public.messages enable row level security;

create policy "Users can view their own chats" on public.chats
  for select using (auth.uid() = user_id);
create policy "Users can insert their own chats" on public.chats
  for insert with check (auth.uid() = user_id);
create policy "Users can delete their own chats" on public.chats
  for delete using (auth.uid() = user_id);

create policy "Users can view their own messages" on public.messages
  for select using (auth.uid() = user_id);
create policy "Users can insert their own messages" on public.messages
  for insert with check (auth.uid() = user_id);
create policy "Users can delete their own messages" on public.messages
  for delete using (auth.uid() = user_id);

-- Table for tracking user usage limits (24h rolling window)
create table public.user_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  requests_count integer default 0 not null,
  last_request_timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  reset_timestamp timestamp with time zone default timezone('utc'::text, now()) + interval '24 hours' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_usage enable row level security;

create policy "Users can view their own usage" on public.user_usage
  for select using (auth.uid() = user_id);
create policy "Users can update their own usage" on public.user_usage
  for update using (auth.uid() = user_id);
create policy "Users can insert their own usage" on public.user_usage
  for insert with check (auth.uid() = user_id);

-- Function to increment user request count (24h rolling window)
CREATE OR REPLACE FUNCTION increment_user_request_count(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer;
  hourly_limit integer := 20;
  usage_record record;
  now_time timestamp with time zone := timezone('utc'::text, now());
BEGIN
  -- Insert or update user usage record
  INSERT INTO user_usage (user_id, requests_count, last_request_timestamp, reset_timestamp)
  VALUES (p_user_id, 1, now_time, now_time + interval '24 hours')
  ON CONFLICT (user_id) DO UPDATE SET
    requests_count = CASE 
      WHEN now_time >= user_usage.reset_timestamp THEN 1  -- Reset after 24h
      ELSE user_usage.requests_count + 1
    END,
    last_request_timestamp = now_time,
    reset_timestamp = CASE
      WHEN now_time >= user_usage.reset_timestamp THEN now_time + interval '24 hours'
      ELSE user_usage.reset_timestamp
    END,
    updated_at = now_time
  RETURNING requests_count, reset_timestamp INTO usage_record;

  -- Return usage info
  RETURN json_build_object(
    'requests_made', usage_record.requests_count,
    'requests_remaining', greatest(0, hourly_limit - usage_record.requests_count),
    'daily_limit', hourly_limit,
    'can_make_request', usage_record.requests_count <= hourly_limit,
    'reset_time', usage_record.reset_timestamp
  );
END;
$$;

-- Function to check user request count without incrementing
CREATE OR REPLACE FUNCTION check_user_request_count(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer := 0;
  hourly_limit integer := 20;
  usage_record record;
  now_time timestamp with time zone := timezone('utc'::text, now());
BEGIN
  -- Get current usage
  SELECT requests_count, reset_timestamp 
  INTO usage_record
  FROM user_usage 
  WHERE user_id = p_user_id;

  -- If no record exists or it's time to reset, count is 0
  IF usage_record IS NULL OR now_time >= usage_record.reset_timestamp THEN
    current_count := 0;
  ELSE
    current_count := usage_record.requests_count;
  END IF;

  -- Return usage info
  RETURN json_build_object(
    'requests_made', current_count,
    'requests_remaining', greatest(0, hourly_limit - current_count),
    'daily_limit', hourly_limit,
    'can_make_request', current_count < hourly_limit,
    'reset_time', COALESCE(usage_record.reset_timestamp, now_time + interval '24 hours')
  );
END;
$$;

-- Function to safely delete user chats with their messages
CREATE OR REPLACE FUNCTION delete_user_chat(p_chat_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if chat exists and belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM chats 
    WHERE id = p_chat_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Chat not found or access denied';
  END IF;

  -- Delete messages first (due to foreign key constraint)
  DELETE FROM messages WHERE chat_id = p_chat_id;
  
  -- Delete the chat
  DELETE FROM chats WHERE id = p_chat_id AND user_id = p_user_id;
END;
$$;
