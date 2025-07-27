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
