import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard, FieldError } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authErrorMessage, passwordSchema } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — ForgePilot" },
      { name: "description", content: "Set a new password for your ForgePilot account." },
      { property: "og:title", content: "Choose a new password — ForgePilot" },
      { property: "og:description", content: "Set a new password for your ForgePilot account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPage,
});

const schema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

function ResetPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // The recovery link signs the user in with a temporary recovery session.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    const t = setTimeout(async () => {
      const { data: s } = await supabase.auth.getSession();
      setReady((r) => r ?? !!s.session);
    }, 1200);
    return () => {
      data.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    setFormError(undefined);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) return setFormError(authErrorMessage(error));
    toast.success("Password updated");
    navigate({ to: "/dashboard", replace: true });
  }

  if (ready === undefined) {
    return (
      <AuthCard title="Verifying link…">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </AuthCard>
    );
  }
  if (!ready) {
    return (
      <AuthCard
        title="Link invalid or expired"
        footer={
          <Link to="/login" className="text-primary-glow hover:underline">
            Back to log in
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          This reset link can't be used. Request a new one.
        </p>
        <Button variant="hero" className="mt-5 w-full" asChild>
          <Link to="/forgot-password">Request new link</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {(["password", "confirm"] as const).map((n) => (
          <div key={n}>
            <Label htmlFor={n}>{n === "password" ? "New password" : "Confirm password"}</Label>
            <Input
              id={n}
              name={n}
              type="password"
              autoComplete="new-password"
              className="mt-1.5"
              aria-invalid={!!errors[n]}
              aria-describedby={`${n}-err`}
            />
            <FieldError id={`${n}-err`} message={errors[n]} />
          </div>
        ))}
        {formError && (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        )}
        <Button type="submit" variant="hero" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />} Update password
        </Button>
      </form>
    </AuthCard>
  );
}
