-- Revert to flat structure for compare_sessions
-- Drop the complex structure and use simple provider columns

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.compare_responses CASCADE;
DROP TABLE IF EXISTS public.compare_sessions CASCADE;

-- Create the flat compare_sessions table
CREATE TABLE public.compare_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chat_id uuid NULL,
  user_question text NOT NULL,
  openai_response text NULL,
  anthropic_response text NULL,
  gemini_response text NULL,
  deepseek_response text NULL,
  perplexity_response text NULL,
  grok_response text NULL,
  summary text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT compare_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT compare_sessions_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE,
  CONSTRAINT compare_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.compare_sessions ENABLE row level security;

-- Create RLS policies
CREATE POLICY "Users can view their own compare sessions" ON public.compare_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compare sessions" ON public.compare_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compare sessions" ON public.compare_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compare sessions" ON public.compare_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS compare_sessions_user_id_idx ON public.compare_sessions USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS compare_sessions_chat_id_idx ON public.compare_sessions USING btree (chat_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS compare_sessions_created_at_idx ON public.compare_sessions USING btree (created_at DESC) TABLESPACE pg_default;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_compare_sessions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER handle_compare_sessions_updated_at
  BEFORE UPDATE ON public.compare_sessions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_compare_sessions_updated_at();