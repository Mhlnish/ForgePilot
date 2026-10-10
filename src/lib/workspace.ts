import { z } from "zod";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

/**
 * Workspace data layer. All reads/writes go through the browser client with the
 * user's session, so Row Level Security enforces ownership. user_id is never
 * sent from the client — the column defaults to auth.uid().
 */

export type Repository = Database["public"]["Tables"]["repositories"]["Row"];
export type Task = Database["public"]["Tables"]["maintenance_tasks"]["Row"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type TaskPriority = Database["public"]["Enums"]["task_priority"];
export type Visibility = Database["public"]["Enums"]["repo_visibility"];

export const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];
// "urgent" is the stored enum value; shown to users as "Critical".
export const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Critical" },
];
export const CATEGORIES = [
  "Bug",
  "Feature",
  "Security",
  "Documentation",
  "Refactoring",
  "Maintenance",
] as const;
export const LANGUAGES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "Kotlin",
  "C",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "Swift",
  "Dart",
  "Shell",
  "Other",
];

export const statusLabel = (s: TaskStatus) => STATUSES.find((x) => x.value === s)?.label ?? s;
export const priorityLabel = (p: TaskPriority) => PRIORITIES.find((x) => x.value === p)?.label ?? p;

export const repositorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Keep it under 100 characters")
    .regex(/^[A-Za-z0-9._\- ]+$/, "Use letters, numbers, spaces, dots, dashes or underscores"),
  description: z.string().trim().max(500, "Keep it under 500 characters"),
  url: z
    .string()
    .trim()
    .max(300)
    .refine(
      (v) => v === "" || /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(v),
      "Use a URL like https://github.com/owner/repo",
    ),
  language: z.string().max(40),
  visibility: z.enum(["public", "private"]),
  default_branch: z
    .string()
    .trim()
    .min(1, "Branch is required")
    .max(100)
    .regex(/^[A-Za-z0-9._/-]+$/, "Invalid branch name"),
});
export type RepositoryInput = z.infer<typeof repositorySchema>;

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Keep it under 200 characters"),
  description: z.string().trim().max(2000, "Keep it under 2000 characters"),
  repository_id: z.string().uuid("Choose a repository"),
  status: z.enum(["backlog", "todo", "in_progress", "review", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.enum(CATEGORIES),
  due_date: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Invalid date"),
});
export type TaskInput = z.infer<typeof taskSchema>;

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

// ---------- Queries ----------
export const reposQuery = () =>
  queryOptions({
    queryKey: ["repositories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repositories")
        .select("*")
        .order("updated_at", { ascending: false });
      fail(error);
      return data ?? [];
    },
  });

export const repoQuery = (id: string) =>
  queryOptions({
    queryKey: ["repositories", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repositories")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      fail(error);
      return data; // null when missing or owned by someone else (RLS)
    },
  });

export const tasksQuery = () =>
  queryOptions({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("*")
        .order("position", { ascending: true });
      fail(error);
      return data ?? [];
    },
  });

// ---------- Mutations ----------
const nullIfEmpty = (v: string) => (v.trim() === "" ? null : v.trim());

export async function createRepository(input: RepositoryInput) {
  const { data, error } = await supabase
    .from("repositories")
    .insert({
      name: input.name,
      description: nullIfEmpty(input.description),
      url: nullIfEmpty(input.url),
      language: nullIfEmpty(input.language),
      visibility: input.visibility,
      default_branch: input.default_branch,
      provider: "manual",
    })
    .select()
    .single();
  fail(error);
  return data!;
}

export async function updateRepository(id: string, input: RepositoryInput) {
  const { error } = await supabase
    .from("repositories")
    .update({
      name: input.name,
      description: nullIfEmpty(input.description),
      url: nullIfEmpty(input.url),
      language: nullIfEmpty(input.language),
      visibility: input.visibility,
      default_branch: input.default_branch,
    })
    .eq("id", id);
  fail(error);
}

export async function deleteRepository(id: string) {
  // Tasks linked to the repo are removed first so nothing is left orphaned.
  const t = await supabase.from("maintenance_tasks").delete().eq("repository_id", id);
  fail(t.error);
  const { error } = await supabase.from("repositories").delete().eq("id", id);
  fail(error);
}

export async function markRepositoryOpened(id: string) {
  const { error } = await supabase
    .from("repositories")
    .update({ last_opened_at: new Date().toISOString() })
    .eq("id", id);
  fail(error);
}

/** Position after the last task in a column. */
export function nextPosition(tasks: Task[], status: TaskStatus) {
  const col = tasks.filter((t) => t.status === status);
  return col.length ? Math.max(...col.map((t) => t.position)) + 1024 : 1024;
}

export async function createTask(input: TaskInput, position: number) {
  const { error } = await supabase.from("maintenance_tasks").insert({
    title: input.title,
    description: nullIfEmpty(input.description),
    repository_id: input.repository_id,
    status: input.status,
    priority: input.priority,
    category: input.category,
    due_date: input.due_date || null,
    position,
  });
  fail(error);
}

export async function updateTask(id: string, input: TaskInput, position?: number) {
  const { error } = await supabase
    .from("maintenance_tasks")
    .update({
      title: input.title,
      description: nullIfEmpty(input.description),
      repository_id: input.repository_id,
      status: input.status,
      priority: input.priority,
      category: input.category,
      due_date: input.due_date || null,
      ...(position !== undefined ? { position } : {}),
    })
    .eq("id", id);
  fail(error);
}

export async function moveTask(id: string, status: TaskStatus, position: number) {
  const { error } = await supabase
    .from("maintenance_tasks")
    .update({ status, position })
    .eq("id", id);
  fail(error);
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("maintenance_tasks").delete().eq("id", id);
  fail(error);
}

/**
 * Compute a new position for placing a task at `index` within a column
 * (column given without the moving task). Uses midpoints so only one row changes.
 */
export function positionAt(column: Task[], index: number) {
  const before = column[index - 1]?.position;
  const after = column[index]?.position;
  if (before === undefined && after === undefined) return 1024;
  if (before === undefined) return after! - 1024;
  if (after === undefined) return before + 1024;
  return (before + after) / 2;
}

export function formatDate(v: string | null | undefined) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
export function timeAgo(v: string | null | undefined) {
  if (!v) return "Never";
  const s = Math.round((Date.now() - new Date(v).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDate(v);
}
