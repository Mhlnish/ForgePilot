ALTER TABLE public.repositories ADD COLUMN IF NOT EXISTS default_branch text NOT NULL DEFAULT 'main';
ALTER TABLE public.repositories ADD COLUMN IF NOT EXISTS last_opened_at timestamptz;

-- Opening a repository should not count as an edit: only bump updated_at when real fields change.
CREATE OR REPLACE FUNCTION public.set_repo_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF (to_jsonb(NEW) - 'last_opened_at' - 'updated_at') IS DISTINCT FROM (to_jsonb(OLD) - 'last_opened_at' - 'updated_at') THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS repos_updated ON public.repositories;
CREATE TRIGGER repos_updated BEFORE UPDATE ON public.repositories FOR EACH ROW EXECUTE FUNCTION public.set_repo_updated_at();
CREATE INDEX IF NOT EXISTS tasks_board_idx ON public.maintenance_tasks (user_id, status, position);