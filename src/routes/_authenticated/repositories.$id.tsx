import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, PageHeader } from "@/components/app/AppShell";
import { RepositoryFormDialog } from "@/components/app/RepositoryFormDialog";
import { TaskFormDialog } from "@/components/app/TaskFormDialog";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import {
  STATUSES,
  deleteRepository,
  formatDate,
  markRepositoryOpened,
  priorityLabel,
  repoQuery,
  reposQuery,
  statusLabel,
  tasksQuery,
  timeAgo,
} from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/repositories/$id")({
  head: () => ({
    meta: [
      { title: "Repository — ForgePilot" },
      { name: "description", content: "Repository overview and maintenance tasks." },
      { property: "og:title", content: "Repository — ForgePilot" },
      { property: "og:description", content: "Repository overview and maintenance tasks." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RepositoryDetails,
});

function RepositoryDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const repo = useQuery(repoQuery(id));
  const repos = useQuery(reposQuery());
  const tasks = useQuery(tasksQuery());
  const [editOpen, setEditOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const exists = !!repo.data;
  useEffect(() => {
    if (!exists) return;
    markRepositoryOpened(id)
      .then(() => qc.invalidateQueries({ queryKey: ["repositories"], exact: true }))
      .catch(() => {});
  }, [id, exists, qc]);

  const repoTasks = useMemo(
    () => (tasks.data ?? []).filter((t) => t.repository_id === id),
    [tasks.data, id],
  );
  const recent = useMemo(
    () =>
      [...repoTasks]
        .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
        .slice(0, 5),
    [repoTasks],
  );

  if (repo.isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-40" />
      </div>
    );
  if (repo.isError)
    return <ErrorState message="Couldn't load this repository." onRetry={() => repo.refetch()} />;
  if (!repo.data) {
    return (
      <EmptyState
        title="Repository not found"
        body="It may have been deleted, or it doesn't belong to your account."
        action={
          <Button asChild variant="outline">
            <Link to="/repositories">
              <ArrowLeft /> Back to repositories
            </Link>
          </Button>
        }
      />
    );
  }
  const r = repo.data;

  return (
    <>
      <Link
        to="/repositories"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Repositories
      </Link>
      <PageHeader
        title={r.name}
        description={r.description ?? "No description yet."}
        actions={
          <>
            <Button onClick={() => setTaskOpen(true)}>
              <Plus /> Create task
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil /> Edit
            </Button>
            <Button variant="outline" onClick={() => setDelOpen(true)} className="text-destructive">
              <Trash2 /> Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-border bg-card/40 p-5 lg:col-span-1">
          <h2 className="mb-3 text-sm font-medium">Details</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">GitHub URL</dt>
            <dd className="min-w-0 break-all">
              {r.url ? (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-glow hover:underline"
                >
                  {r.url.replace("https://github.com/", "")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                "—"
              )}
            </dd>
            <dt className="text-muted-foreground">Language</dt>
            <dd>{r.language ?? "—"}</dd>
            <dt className="text-muted-foreground">Visibility</dt>
            <dd>{r.visibility === "private" ? "Private" : "Public"}</dd>
            <dt className="text-muted-foreground">Default branch</dt>
            <dd className="font-mono text-xs leading-5">{r.default_branch}</dd>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDate(r.created_at)}</dd>
            <dt className="text-muted-foreground">Last updated</dt>
            <dd>{timeAgo(r.updated_at)}</dd>
            <dt className="text-muted-foreground">Last opened</dt>
            <dd>{timeAgo(r.last_opened_at)}</dd>
            <dt className="text-muted-foreground">GitHub sync</dt>
            <dd>
              <Badge variant="outline">Coming soon</Badge>
            </dd>
          </dl>
        </section>

        <section className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5" data-testid="repo-task-stats">
            {STATUSES.map((s) => (
              <div key={s.value} className="rounded-lg border border-border bg-card/40 p-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-xl font-semibold">
                  {tasks.isLoading ? "–" : repoTasks.filter((t) => t.status === s.value).length}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-card/40 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">Recent tasks</h2>
              <Link
                to="/tasks"
                search={{ repo: r.id }}
                className="text-xs text-primary-glow hover:underline"
              >
                Open board
              </Link>
            </div>
            {tasks.isLoading ? (
              <Skeleton className="h-20" />
            ) : recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No maintenance tasks yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                  >
                    <span className="min-w-0 break-words">{t.title}</span>
                    <span className="flex gap-1.5">
                      <Badge variant="secondary">{statusLabel(t.status)}</Badge>
                      <Badge variant="outline">{priorityLabel(t.priority)}</Badge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <RepositoryFormDialog open={editOpen} onOpenChange={setEditOpen} repository={r} />
      <TaskFormDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        repositories={repos.data ?? [r]}
        tasks={tasks.data ?? []}
        defaultRepositoryId={r.id}
      />
      <ConfirmDialog
        open={delOpen}
        onOpenChange={setDelOpen}
        title={`Delete ${r.name}?`}
        description={`This permanently deletes the repository and its ${repoTasks.length} task(s). This can't be undone.`}
        onConfirm={async () => {
          try {
            await deleteRepository(r.id);
            qc.removeQueries({ queryKey: ["repositories", r.id] });
            await qc.invalidateQueries({ queryKey: ["repositories"] });
            await qc.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Repository deleted");
            navigate({ to: "/repositories" });
          } catch {
            toast.error("Couldn't delete the repository.");
          }
        }}
      />
    </>
  );
}
