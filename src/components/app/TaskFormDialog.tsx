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
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  createTask,
  nextPosition,
  taskSchema,
  updateTask,
  type Repository,
  type Task,
  type TaskInput,
} from "@/lib/workspace";

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  repositories,
  tasks,
  defaultRepositoryId,
  defaultStatus = "backlog",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  task?: Task | undefined;
  repositories: Repository[];
  tasks: Task[];
  defaultRepositoryId?: string | undefined;
  defaultStatus?: TaskInput["status"];
}) {
  const qc = useQueryClient();
  const [v, setV] = useState<TaskInput>({} as TaskInput);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskInput, string>>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setV(
      task
        ? {
            title: task.title,
            description: task.description ?? "",
            repository_id: task.repository_id ?? "",
            status: task.status,
            priority: task.priority,
            category: (CATEGORIES as readonly string[]).includes(task.category ?? "")
              ? (task.category as TaskInput["category"])
              : "Maintenance",
            due_date: task.due_date ?? "",
          }
        : {
            title: "",
            description: "",
            repository_id: defaultRepositoryId ?? repositories[0]?.id ?? "",
            status: defaultStatus,
            priority: "medium",
            category: "Maintenance",
            due_date: "",
          },
    );
  }, [open, task, defaultRepositoryId, defaultStatus, repositories]);

  const set = <K extends keyof TaskInput>(k: K, val: TaskInput[K]) =>
    setV((s) => ({ ...s, [k]: val }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = taskSchema.safeParse(v);
    if (!parsed.success) {
      const errs: typeof errors = {};
      for (const i of parsed.error.issues) errs[i.path[0] as keyof TaskInput] ??= i.message;
      setErrors(errs);
      return;
    }
    setBusy(true);
    try {
      if (task) {
        // Moving to another column via the form puts the task at the end of that column.
        const pos =
          task.status !== parsed.data.status ? nextPosition(tasks, parsed.data.status) : undefined;
        await updateTask(task.id, parsed.data, pos);
      } else {
        await createTask(parsed.data, nextPosition(tasks, parsed.data.status));
      }
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(task ? "Task updated" : "Task created");
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save the task. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "Create task"}</DialogTitle>
          <DialogDescription>Every task belongs to one of your repositories.</DialogDescription>
        </DialogHeader>
        {repositories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add a repository first — tasks are attached to a repository.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={v.title ?? ""}
                onChange={(e) => set("title", e.target.value)}
              />
              <FieldError id="err-title" message={errors.title} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                rows={3}
                value={v.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
              />
              <FieldError id="err-description" message={errors.description} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-repo">Repository</Label>
              <select
                id="task-repo"
                className={selectClass}
                value={v.repository_id ?? ""}
                onChange={(e) => set("repository_id", e.target.value)}
              >
                {repositories.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <FieldError id="err-repository_id" message={errors.repository_id} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="task-status">Status</Label>
                <select
                  id="task-status"
                  className={selectClass}
                  value={v.status}
                  onChange={(e) => set("status", e.target.value as TaskInput["status"])}
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-priority">Priority</Label>
                <select
                  id="task-priority"
                  className={selectClass}
                  value={v.priority}
                  onChange={(e) => set("priority", e.target.value as TaskInput["priority"])}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-category">Category</Label>
                <select
                  id="task-category"
                  className={selectClass}
                  value={v.category}
                  onChange={(e) => set("category", e.target.value as TaskInput["category"])}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-due">Due date</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={v.due_date ?? ""}
                  onChange={(e) => set("due_date", e.target.value)}
                />
                <FieldError id="err-due_date" message={errors.due_date} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : task ? "Save changes" : "Create task"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
