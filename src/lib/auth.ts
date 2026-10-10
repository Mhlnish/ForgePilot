import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const emailSchema = z.string().trim().email("Enter a valid email address").max(255);
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

/** Only allow same-origin relative paths as post-login destinations. */
export function safeRedirect(path: unknown): string {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//"))
    return "/dashboard";
  return path;
}

/** Client-side session state. Undefined while loading (and during SSR). */
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

/** Human-friendly auth error messages without leaking internals. */
export function authErrorMessage(
  err: { message?: string | undefined; code?: string | undefined } | null,
): string {
  const msg = err?.message?.toLowerCase() ?? "";
  if (msg.includes("invalid login")) return "Incorrect email or password.";
  if (msg.includes("email not confirmed"))
    return "Please confirm your email first — check your inbox.";
  if (msg.includes("already registered")) return "An account with this email already exists.";
  if (msg.includes("rate limit") || msg.includes("security purposes"))
    return "Too many attempts. Please wait a moment and try again.";
  if (msg.includes("weak") || msg.includes("pwned"))
    return "This password is too weak or has appeared in a data breach. Choose another.";
  return err?.message || "Something went wrong. Please try again.";
}
