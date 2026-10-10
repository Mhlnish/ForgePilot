import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, PageHeader, selectClass } from "@/components/app/AppShell";
import { TaskBoard } from "@/components/app/TaskBoard";
import { TaskFormDialog } from "@/components/app/TaskFormDialog";
import { CATEGORIES, PRIORITIES, reposQuery, tasksQuery, type Task } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/tasks")({
  validateSearch: z.object({ repo: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Task board — ForgePilot" },
      { name: "description", content: "Kanban board for your maintenance tasks." },
      { property: "og:title", content: "Task board — ForgePilot" },
      { property: "og:description", content: "Kanban board for your maintenance tasks." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const search = Route.useSearch();
  const repos = useQuery(reposQuery());
  const tasks = useQuery(tasksQuery());
  const [q, setQ] = useState("");
  const [repo, setRepo] = useState(search.repo ?? "");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (tasks.data ?? []).filter(
      (t) =>
        (!term ||
          t.title.toLowerCase().includes(term) ||
          (t.description ?? "").toLowerCase().includes(term)) &&
        (!repo || t.repository_id === repo) &&
        (!priority || t.priority === priority) &&
        (!category || t.category === category),
    );
  }, [tasks.data, q, repo, priority, category]);
  const hasFilters = q || repo || priority || category;

  const loading = tasks.isLoading || repos.isLoading;
  const noRepos = !loading && (repos.data ?? []).length === 0;

  return (
    <>
      <PageHeader
        title="Task board"
        description="Drag cards between columns, or use the arrow buttons. Order is saved automatically."
        actions={
          <Button
            disabled={noRepos}
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus /> Create task
          </Button>
        }
      />
      {tasks.isError || repos.isError ? (
        <ErrorState
          message="Couldn't load your tasks."
          onRetry={() => {
            tasks.refetch();
            repos.refetch();
          }}
        />
      ) : loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : noRepos ? (
        <EmptyState
          title="No maintenance tasks yet."
          body="Tasks belong to a repository. Add a repository first."
          action={
            <Button asChild>
              <Link to="/repositories">Go to repositories</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_180px_150px_160px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="Search tasks"
                placeholder="Search tasks"
                className="pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter by repository"
              className={selectClass}
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
            >
              <option value="">All repositories</option>
              {repos.data!.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by priority"
              className={selectClass}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">All priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by category"
              className={selectClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              disabled={!hasFilters}
              onClick={() => {
                setQ("");
                setRepo("");
                setPriority("");
                setCategory("");
              }}
            >
              <X /> Clear
            </Button>
          </div>
          {tasks.data!.length === 0 && (
            <p className="mb-3 text-sm text-muted-foreground">
              No maintenance tasks yet. Create your first one.
            </p>
          )}
          <TaskBoard
            tasks={filtered}
            allTasks={tasks.data!}
            repositories={repos.data!}
            onEdit={(t) => {
              setEditing(t);
              setFormOpen(true);
            }}
          />
        </>
      )}
      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        repositories={repos.data ?? []}
        tasks={tasks.data ?? []}
        defaultRepositoryId={repo || undefined}
      />
    </>
  );
}
