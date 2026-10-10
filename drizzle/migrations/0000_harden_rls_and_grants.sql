REVOKE ALL ON public.profiles, public.user_preferences, public.repositories, public.maintenance_tasks, public.release_drafts, public.assistant_conversations, public.assistant_messages FROM anon;

DROP POLICY IF EXISTS "own update" ON public.assistant_messages;
CREATE POLICY "own update" ON public.assistant_messages FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.assistant_conversations c
    WHERE c.id = assistant_messages.conversation_id AND c.user_id = auth.uid()));

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
