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
import { authErrorMessage, emailSchema, safeRedirect } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } =>
    typeof s["redirect"] === "string" ? { redirect: s["redirect"] } : {},
  head: () => ({
    meta: [
      { title: "Log in — ForgePilot" },
      { name: "description", content: "Log in to your ForgePilot maintenance workspace." },
      { property: "og:title", content: "Log in — ForgePilot" },
      { property: "og:description", content: "Log in to your ForgePilot maintenance workspace." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password") });

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: safeRedirect(redirect), replace: true });
    });
  }, [navigate, redirect]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    setFormError(undefined);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) return setFormError(authErrorMessage(error));
    toast.success("Logged in");
    navigate({ to: safeRedirect(redirect), replace: true });
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your workspace."
      footer={
        <>
          New to ForgePilot?{" "}
          <Link to="/signup" className="text-primary-glow hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="mt-1.5"
            aria-invalid={!!errors["email"]}
            aria-describedby="email-err"
          />
          <FieldError id="email-err" message={errors["email"]} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary-glow hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="mt-1.5"
            aria-invalid={!!errors["password"]}
            aria-describedby="password-err"
          />
          <FieldError id="password-err" message={errors["password"]} />
        </div>
        {formError && (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        )}
        <Button type="submit" variant="hero" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />} Log in
        </Button>
      </form>
    </AuthCard>
  );
}
