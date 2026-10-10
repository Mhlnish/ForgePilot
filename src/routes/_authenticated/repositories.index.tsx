import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Globe, Lock, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, PageHeader, selectClass } from "@/components/app/AppShell";
import { RepositoryFormDialog } from "@/components/app/RepositoryFormDialog";
import { reposQuery, timeAgo } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/repositories/")({
  head: () => ({
    meta: [
      { title: "Repositories — ForgePilot" },
      { name: "description", content: "Manage the open source repositories you maintain." },
      { property: "og:title", content: "Repositories — ForgePilot" },
      { property: "og:description", content: "Manage the open source repositories you maintain." },
    ],
  }),
  component: RepositoriesPage,
});

function RepositoriesPage() {
  const navigate = useNavigate();
  const repos = useQuery(reposQuery());
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("");
  const [vis, setVis] = useState("");
  const [sort, setSort] = useState<"updated_desc" | "updated_asc">("updated_desc");
  const [open, setOpen] = useState(false);

  const languages = useMemo(
    () =>
      [...new Set((repos.data ?? []).map((r) => r.language).filter(Boolean) as string[])].sort(),
    [repos.data],
  );
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (repos.data ?? [])
      .filter((r) => !term || r.name.toLowerCase().includes(term))
      .filter((r) => !lang || r.language === lang)
      .filter((r) => !vis || r.visibility === vis)
      .sort(
        (a, b) =>
          (sort === "updated_desc" ? -1 : 1) *
          (Date.parse(a.updated_at) - Date.parse(b.updated_at)),
      );
  }, [repos.data, q, lang, vis, sort]);
  const hasFilters = q || lang || vis || sort !== "updated_desc";

  return (
    <>
      <PageHeader
        title="Repositories"
        description="Projects you maintain. GitHub URLs are stored as references — no sync yet."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus /> Add repository
          </Button>
        }
      />

      {repos.isError ? (
        <ErrorState message="Couldn't load your repositories." onRetry={() => repos.refetch()} />
      ) : repos.isLoading ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : repos.data!.length === 0 ? (
        <EmptyState
          title="Your workspace is empty."
          body="Add your first repository to start managing your project."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus /> Add repository
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_170px_150px_190px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="Search repositories"
                placeholder="Search by name"
                className="pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter by language"
              className={selectClass}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="">All languages</option>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by visibility"
              className={selectClass}
              value={vis}
              onChange={(e) => setVis(e.target.value)}
            >
              <option value="">All visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <select
              aria-label="Sort"
              className={selectClass}
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
            >
              <option value="updated_desc">Recently updated</option>
              <option value="updated_asc">Least recently updated</option>
            </select>
            <Button
              variant="ghost"
              disabled={!hasFilters}
              onClick={() => {
                setQ("");
                setLang("");
                setVis("");
                setSort("updated_desc");
              }}
            >
              <X /> Clear
            </Button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No repositories match these filters."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQ("");
                    setLang("");
                    setVis("");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-3" data-testid="repo-list">
              {filtered.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/repositories/$id"
                    params={{ id: r.id }}
                    className="block rounded-lg border border-border bg-card/40 p-4 transition-colors hover:border-primary/50 hover:bg-card"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="min-w-0 break-all font-medium">{r.name}</span>
                      <Badge variant="outline" className="gap-1">
                        {r.visibility === "private" ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <Globe className="h-3 w-3" />
                        )}
                        {r.visibility === "private" ? "Private" : "Public"}
                      </Badge>
                      {r.language && <Badge variant="secondary">{r.language}</Badge>}
                    </div>
                    {r.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {r.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Updated {timeAgo(r.updated_at)} · Opened {timeAgo(r.last_opened_at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <RepositoryFormDialog
        open={open}
        onOpenChange={setOpen}
        onSaved={({ id }) => navigate({ to: "/repositories/$id", params: { id } })}
      />
    </>
  );
}
