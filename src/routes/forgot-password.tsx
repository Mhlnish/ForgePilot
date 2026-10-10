import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard, FieldError } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authErrorMessage, emailSchema } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — ForgePilot" },
      {
        name: "description",
        content: "Request a password reset link for your ForgePilot account.",
      },
      { property: "og:title", content: "Reset your password — ForgePilot" },
      {
        property: "og:description",
        content: "Request a password reset link for your ForgePilot account.",
      },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(new FormData(e.currentTarget).get("email"));
    setFormError(undefined);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid email");
    setError(undefined);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return setFormError(authErrorMessage(error));
    setSent(true);
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle={sent ? undefined : "We'll email you a link to choose a new password."}
      footer={
        <Link to="/login" className="text-primary-glow hover:underline">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <div className="flex gap-3 text-sm text-muted-foreground">
          <MailCheck className="h-5 w-5 shrink-0 text-success" />
          <p>If an account exists for that email, a reset link is on its way.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="mt-1.5"
              aria-invalid={!!error}
              aria-describedby="email-err"
            />
            <FieldError id="email-err" message={error} />
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
            {loading && <Loader2 className="animate-spin" />} Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
