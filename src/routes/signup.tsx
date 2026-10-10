import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard, FieldError } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authErrorMessage, emailSchema, passwordSchema } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — ForgePilot" },
      {
        name: "description",
        content: "Create a ForgePilot account to organize repository maintenance.",
      },
      { property: "og:title", content: "Create your account — ForgePilot" },
      {
        property: "og:description",
        content: "Create a ForgePilot account to organize repository maintenance.",
      },
    ],
  }),
  component: SignupPage,
});

const schema = z
  .object({
    name: z.string().trim().min(1, "Enter your name").max(80),
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

function SignupPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string>();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    setFormError(undefined);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: parsed.data.name },
      },
    });
    setLoading(false);
    if (error) return setFormError(authErrorMessage(error));
    setSentTo(parsed.data.email);
  }

  if (sentTo) {
    return (
      <AuthCard
        title="Check your inbox"
        footer={
          <Link to="/login" className="text-primary-glow hover:underline">
            Back to log in
          </Link>
        }
      >
        <div className="flex gap-3 text-sm text-muted-foreground">
          <MailCheck className="h-5 w-5 shrink-0 text-success" />
          <p>
            If <span className="text-foreground">{sentTo}</span> can be registered, we've sent a
            confirmation link to it. Open it to activate your account, then log in.
          </p>
        </div>
      </AuthCard>
    );
  }

  const field = (name: string, label: string, type: string, autoComplete: string) => (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="mt-1.5"
        aria-invalid={!!errors[name]}
        aria-describedby={`${name}-err`}
      />
      <FieldError id={`${name}-err`} message={errors[name]} />
    </div>
  );

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start organizing your maintenance work."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary-glow hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {field("name", "Name", "text", "name")}
        {field("email", "Email", "email", "email")}
        {field("password", "Password", "password", "new-password")}
        <p className="-mt-2 text-xs text-muted-foreground">
          At least 8 characters, with a letter and a number.
        </p>
        {field("confirm", "Confirm password", "password", "new-password")}
        {formError && (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        )}
        <Button type="submit" variant="hero" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />} Create account
        </Button>
      </form>
    </AuthCard>
  );
}
