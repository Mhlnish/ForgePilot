import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CircleDot, FolderGit2, ListTodo, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, PageHeader } from "@/components/app/AppShell";
import { RepositoryFormDialog } from "@/components/app/RepositoryFormDialog";
import { TaskFormDialog } from "@/components/app/TaskFormDialog";
import { reposQuery, statusLabel, tasksQuery, timeAgo } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ForgePilot" },
      { name: "description", content: "Your ForgePilot maintenance dashboard." },
      { property: "og:title", content: "Dashboard — ForgePilot" },
      { property: "og:description", content: "Your ForgePilot maintenance dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const profile = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const repos = useQuery(reposQuery());
  const tasks = useQuery(tasksQuery());
  const [repoOpen, setRepoOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);

  const t = tasks.data ?? [];
  const r = repos.data ?? [];
  const stats = [
    { label: "Repositories", value: r.length, icon: FolderGit2 },
    { label: "Open tasks", value: t.filter((x) => x.status !== "done").length, icon: ListTodo },
    {
      label: "In progress",
      value: t.filter((x) => x.status === "in_progress").length,
      icon: CircleDot,
    },
    { label: "Completed", value: t.filter((x) => x.status === "done").length, icon: CheckCircle2 },
  ];

  // Activity derived from real record timestamps — no separate log yet.
  const activity = useMemo(() => {
    const items = [
      ...r.map((x) => ({
        key: `r-${x.id}`,
        at: x.updated_at,
        text: `${x.created_at === x.updated_at ? "Added" : "Updated"} repository ${x.name}`,
        to: x.id,
      })),
      ...t.map((x) => ({
        key: `t-${x.id}`,
        at: x.updated_at,
        text: `Task "${x.title}" · ${statusLabel(x.status)}`,
        to: x.repository_id,
      })),
    ];
    return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 8);
  }, [r, t]);
  const recentlyOpened = useMemo(
    () =>
      r
        .filter((x) => x.last_opened_at)
        .sort((a, b) => Date.parse(b.last_opened_at!) - Date.parse(a.last_opened_at!))
        .slice(0, 5),
    [r],
  );

  const loading = repos.isLoading || tasks.isLoading;
  const name = profile.data?.display_name ?? user.email;

  return (
    <>
      <PageHeader
        title={profile.isLoading ? "Dashboard" : `Welcome, ${name}`}
        description="An overview of your maintenance work."
        actions={
          <>
            <Button onClick={() => setRepoOpen(true)}>
              <Plus /> Add repository
            </Button>
            <Button variant="outline" disabled={r.length === 0} onClick={() => setTaskOpen(true)}>
              <Plus /> Create task
            </Button>
          </>
        }
      />

      {repos.isError || tasks.isError ? (
        <ErrorState
          message="Couldn't load your dashboard."
          onRetry={() => {
            repos.refetch();
            tasks.refetch();
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="stats">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-border bg-card/40 p-4">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs">{label}</span>
                  <Icon className="h-4 w-4" />
                </div>
                {loading ? (
                  <Skeleton className="mt-2 h-8 w-12" />
                ) : (
                  <p className="mt-2 text-2xl font-semibold" data-stat={label}>
                    {value}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!loading && r.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Your workspace is empty."
                body="Add your first repository to start managing your project."
                action={
                  <Button onClick={() => setRepoOpen(true)}>
                    <Plus /> Add repository
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-5">
              <section className="rounded-lg border border-border bg-card/40 p-5 lg:col-span-3">
                <h2 className="mb-3 text-sm font-medium">Recent activity</h2>
                {loading ? (
                  <Skeleton className="h-32" />
                ) : activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                ) : (
                  <ul className="divide-y divide-border" data-testid="activity">
                    {activity.map((a) => (
                      <li
                        key={a.key}
                        className="flex items-center justify-between gap-3 py-2 text-sm"
                      >
                        <span className="min-w-0 truncate">{a.text}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {timeAgo(a.at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="rounded-lg border border-border bg-card/40 p-5 lg:col-span-2">
                <h2 className="mb-3 text-sm font-medium">Recently opened</h2>
                {loading ? (
                  <Skeleton className="h-32" />
                ) : recentlyOpened.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Repositories you open will appear here.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {recentlyOpened.map((x) => (
                      <li key={x.id}>
                        <Link
                          to="/repositories/$id"
                          params={{ id: x.id }}
                          className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                        >
                          <span className="min-w-0 truncate">{x.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {timeAgo(x.last_opened_at)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </>
      )}

      <RepositoryFormDialog
        open={repoOpen}
        onOpenChange={setRepoOpen}
        onSaved={({ id }) => navigate({ to: "/repositories/$id", params: { id } })}
      />
      <TaskFormDialog open={taskOpen} onOpenChange={setTaskOpen} repositories={r} tasks={t} />
    </>
  );
}
