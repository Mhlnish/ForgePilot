import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/auth/AuthCard";
import { selectClass } from "@/components/app/AppShell";
import {
  LANGUAGES,
  createRepository,
  repositorySchema,
  updateRepository,
  type Repository,
  type RepositoryInput,
} from "@/lib/workspace";

const empty: RepositoryInput = {
  name: "",
  description: "",
  url: "",
  language: "",
  visibility: "public",
  default_branch: "main",
};

export function RepositoryFormDialog({
  open,
  onOpenChange,
  repository,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  repository?: Repository | undefined;
  onSaved?: ((r: { id: string }) => void) | undefined;
}) {
  const qc = useQueryClient();
  const [values, setValues] = useState<RepositoryInput>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof RepositoryInput, string>>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setValues(
      repository
        ? {
            name: repository.name,
            description: repository.description ?? "",
            url: repository.url ?? "",
            language: repository.language ?? "",
            visibility: repository.visibility,
            default_branch: repository.default_branch,
          }
        : empty,
    );
  }, [open, repository]);

  const set = <K extends keyof RepositoryInput>(k: K, v: RepositoryInput[K]) =>
    setValues((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = repositorySchema.safeParse(values);
    if (!parsed.success) {
      const errs: typeof errors = {};
      for (const i of parsed.error.issues) errs[i.path[0] as keyof RepositoryInput] ??= i.message;
      setErrors(errs);
      return;
    }
    setBusy(true);
    try {
      let id = repository?.id;
      if (repository) await updateRepository(repository.id, parsed.data);
      else id = (await createRepository(parsed.data)).id;
      await qc.invalidateQueries({ queryKey: ["repositories"] });
      toast.success(repository ? "Repository updated" : "Repository added");
      onOpenChange(false);
      onSaved?.({ id: id! });
    } catch (err) {
      toast.error(
        err instanceof Error && err.message.includes("duplicate")
          ? "You already have a repository with that name."
          : "Couldn't save the repository. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{repository ? "Edit repository" : "Add repository"}</DialogTitle>
          <DialogDescription>
            The GitHub URL is saved as a reference only — ForgePilot doesn't sync with GitHub yet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="repo-name">Name</Label>
            <Input
              id="repo-name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="my-project"
            />
            <FieldError id="err-name" message={errors.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="repo-desc">Description</Label>
            <Textarea
              id="repo-desc"
              rows={3}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
            />
            <FieldError id="err-description" message={errors.description} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="repo-url">GitHub URL</Label>
            <Input
              id="repo-url"
              value={values.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://github.com/owner/repo"
            />
            <FieldError id="err-url" message={errors.url} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="repo-lang">Language</Label>
              <select
                id="repo-lang"
                className={selectClass}
                value={values.language}
                onChange={(e) => set("language", e.target.value)}
              >
                <option value="">Not set</option>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="repo-vis">Visibility</Label>
              <select
                id="repo-vis"
                className={selectClass}
                value={values.visibility}
                onChange={(e) => set("visibility", e.target.value as "public" | "private")}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="repo-branch">Default branch</Label>
              <Input
                id="repo-branch"
                value={values.default_branch}
                onChange={(e) => set("default_branch", e.target.value)}
              />
              <FieldError id="err-default_branch" message={errors.default_branch} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : repository ? "Save changes" : "Add repository"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
