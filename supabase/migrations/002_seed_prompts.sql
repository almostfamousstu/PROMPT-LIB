insert into public.prompts (id, user_id, title, body_md, tags, folder)
select gen_random_uuid(), auth.uid(), title, body_md, tags, folder
from (values
  ('Product Launch Email', 'You are a marketing copywriter...', array['marketing','email'], 'Campaigns'),
  ('Customer Support Triage', 'You are an AI support agent...', array['support','triage'], 'Operations'),
  ('UX Research Interview', 'You are a UX researcher preparing...', array['research','interview'], 'Research')
) as seed(title, body_md, tags, folder)
where false;
-- Seeds are illustrative; use Supabase SQL snippets to create user-scoped records after signup.
