import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import {
  STATUSES,
  deleteTask,
  formatDate,
  moveTask,
  positionAt,
  priorityLabel,
  type Repository,
  type Task,
  type TaskStatus,
} from "@/lib/workspace";

const priorityTone: Record<string, string> = {
  low: "border-border text-muted-foreground",
  medium: "border-primary/40 text-primary-glow",
  high: "border-warning/50 text-warning",
  urgent: "border-destructive/60 text-destructive",
};

/**
 * Kanban board. Moves persist status + position to the database; the order shown
 * always comes from the stored position. Supports native drag-and-drop and
 * keyboard-accessible move buttons.
 */
export function TaskBoard({
  tasks,
  allTasks,
  repositories,
  onEdit,
}: {
  tasks: Task[];
  allTasks: Task[];
  repositories: Repository[];
  onEdit: (t: Task) => void;
}) {
  const qc = useQueryClient();
  const [dragId, setDragId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Task | null>(null);
  const repoName = (id: string | null) => repositories.find((r) => r.id === id)?.name ?? "—";

  const column = (status: TaskStatus, source = allTasks) =>
    source.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  async function place(task: Task, status: TaskStatus, index: number) {
    const target = column(status).filter((t) => t.id !== task.id);
    const pos = positionAt(target, Math.max(0, Math.min(index, target.length)));
    // optimistic update, then persist
    qc.setQueryData<Task[]>(["tasks"], (old) =>
      old?.map((t) => (t.id === task.id ? { ...t, status, position: pos } : t)),
    );
    try {
      await moveTask(task.id, status, pos);
    } catch {
      toast.error("Couldn't move the task. Restoring the previous order.");
    } finally {
      await qc.invalidateQueries({ queryKey: ["tasks"] });
    }
  }

  function shift(task: Task, dir: "up" | "down" | "left" | "right") {
    const idx = STATUSES.findIndex((s) => s.value === task.status);
    const col = column(task.status);
    const i = col.findIndex((t) => t.id === task.id);
    if (dir === "up" && i > 0) return place(task, task.status, i - 1);
    if (dir === "down" && i < col.length - 1) return place(task, task.status, i + 1);
    if (dir === "left" && idx > 0)
      return place(task, STATUSES[idx - 1]!.value, Number.MAX_SAFE_INTEGER);
    if (dir === "right" && idx < STATUSES.length - 1)
      return place(task, STATUSES[idx + 1]!.value, Number.MAX_SAFE_INTEGER);
  }

  return (
    <>
      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
        <div className="grid min-w-[1100px] grid-cols-5 gap-3">
          {STATUSES.map((s, sIdx) => {
            const visible = column(s.value, tasks);
            return (
              <section
                key={s.value}
                aria-label={s.label}
                className="flex min-h-64 flex-col rounded-lg border border-border bg-card/40"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const t = allTasks.find((x) => x.id === dragId);
                  if (t) void place(t, s.value, Number.MAX_SAFE_INTEGER);
                  setDragId(null);
                }}
              >
                <header className="flex items-center justify-between border-b border-border px-3 py-2">
                  <h2 className="text-sm font-medium">{s.label}</h2>
                  <span className="text-xs text-muted-foreground">{visible.length}</span>
                </header>
                <ol className="flex flex-1 flex-col gap-2 p-2">
                  {visible.length === 0 && (
                    <li className="px-1 py-6 text-center text-xs text-muted-foreground">
                      No tasks
                    </li>
                  )}
                  {visible.map((t) => {
                    const full = column(s.value);
                    const i = full.findIndex((x) => x.id === t.id);
                    return (
                      <li
                        key={t.id}
                        draggable
                        onDragStart={() => setDragId(t.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const d = allTasks.find((x) => x.id === dragId);
                          if (d && d.id !== t.id) {
                            const target = full.filter((x) => x.id !== d.id);
                            void place(
                              d,
                              s.value,
                              target.findIndex((x) => x.id === t.id),
                            );
                          }
                          setDragId(null);
                        }}
                        data-testid="task-card"
                        className={cn(
                          "group rounded-md border border-border bg-background p-3 shadow-card",
                          dragId === t.id && "opacity-50",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 break-words text-sm font-medium">{t.title}</p>
                          <div className="flex shrink-0 gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              aria-label={`Edit ${t.title}`}
                              onClick={() => onEdit(t)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              aria-label={`Delete ${t.title}`}
                              onClick={() => setToDelete(t)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {repoName(t.repository_id)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className={priorityTone[t.priority]}>
                            {priorityLabel(t.priority)}
                          </Badge>
                          {t.category && <Badge variant="secondary">{t.category}</Badge>}
                          {t.due_date && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(t.due_date)}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex gap-0.5 opacity-70 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            aria-label="Move left"
                            disabled={sIdx === 0}
                            onClick={() => shift(t, "left")}
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            aria-label="Move up"
                            disabled={i <= 0}
                            onClick={() => shift(t, "up")}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            aria-label="Move down"
                            disabled={i >= full.length - 1}
                            onClick={() => shift(t, "down")}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            aria-label="Move right"
                            disabled={sIdx === STATUSES.length - 1}
                            onClick={() => shift(t, "right")}
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      </div>
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this task?"
        description={`"${toDelete?.title ?? ""}" will be permanently removed.`}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteTask(toDelete.id);
            toast.success("Task deleted");
          } catch {
            toast.error("Couldn't delete the task.");
          }
          await qc.invalidateQueries({ queryKey: ["tasks"] });
        }}
      />
    </>
  );
}
