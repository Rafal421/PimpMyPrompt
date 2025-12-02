create policy "Users can update their own chats" on public.chats
  for update using (auth.uid() = user_id);