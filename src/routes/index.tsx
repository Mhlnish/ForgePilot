import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import {
  ArrowRight,
  Bot,
  BookOpen,
  CircleDot,
  FileText,
  FolderGit2,
  GitPullRequest,
  KanbanSquare,
  Lock,
  Scale,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

const TITLE = "ForgePilot — Maintain Open Source Without the Overhead";
const DESC =
  "ForgePilot helps developers understand repositories, streamline maintenance, and ship reliable software with AI.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: FolderGit2,
    title: "Repository workspace",
    body: "Keep every project you maintain in one place, with context the assistant can work from.",
  },
  {
    icon: Bot,
    title: "AI repository assistant",
    body: "Ask for explanations, maintenance priorities, test ideas, and refactoring plans.",
  },
  {
    icon: KanbanSquare,
    title: "Maintenance board",
    body: "Backlog to Done. Priorities, due dates, categories, search and filters.",
  },
  {
    icon: FileText,
    title: "Release notes",
    body: "Turn changes, fixes and breaking changes into a clean Markdown draft you can edit.",
  },
  {
    icon: GitPullRequest,
    title: "Built for review",
    body: "Designed around the review-and-ship loop, ready for GitHub integration.",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "Your workspace data is isolated per account. Secrets never touch the browser.",
  },
];

const steps = [
  {
    n: "01",
    title: "Add your repositories",
    body: "Register the projects you maintain with name, URL, language and visibility.",
  },
  {
    n: "02",
    title: "Organize the work",
    body: "Capture issues and chores on a board so nothing slips between releases.",
  },
  {
    n: "03",
    title: "Review and ship",
    body: "Use the assistant to reason about code, then draft release notes in minutes.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
        <nav
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"
          aria-label="Main"
        >
          <a href="/" aria-label="ForgePilot home">
            <Logo />
          </a>
          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#open-source" className="hover:text-foreground">
              Open source
            </a>
          </div>
          <HeaderAuth />
        </nav>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
        <div className="absolute inset-0 bg-grid" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 text-center md:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" /> Build. Review. Ship.
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] sm:text-6xl md:text-7xl">
            Maintain Open Source. <span className="text-gradient">Without the Overhead.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{DESC}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryCta />
            <Button variant="glass" size="xl" asChild>
              <a href="#features">Explore Features</a>
            </Button>
          </div>
          <ProductMockup />
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h2 className="text-3xl font-semibold sm:text-4xl">
          One workspace for the unglamorous part of software.
        </h2>
        <p className="mt-5 text-muted-foreground">
          Triage, chores, reviews, changelogs. ForgePilot gathers the maintenance work around your
          repositories and pairs it with an assistant that helps you reason about it — so you spend
          more time building.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-primary-glow">Features</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
          Everything a maintainer reaches for.
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-surface p-7 transition-colors hover:bg-accent/40"
            >
              <f.icon className="h-6 w-6 text-primary-glow" />
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-primary-glow">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
          Three steps from noise to release.
        </h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.n}
              className="rounded-2xl border border-border bg-gradient-surface p-7 shadow-card"
            >
              <span className="font-mono text-sm text-primary-glow">{s.n}</span>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Open source */}
      <section id="open-source" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
        <div className="grid items-center gap-10 rounded-3xl border border-border bg-surface p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary-glow">
              Our mission
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Made for the people who keep open source running.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Maintainers carry a lot of invisible work. ForgePilot is built to lighten it —
              transparent about what is AI, honest about what is connected, and respectful of your
              data.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              {
                icon: Scale,
                t: "No fabricated data",
                d: "We never show synced repositories or AI analysis that didn't happen.",
              },
              {
                icon: Lock,
                t: "Privacy-conscious",
                d: "Per-user isolation and server-side handling of credentials.",
              },
              {
                icon: BookOpen,
                t: "Transparent demo mode",
                d: "When AI isn't configured, sample responses are clearly labeled.",
              },
            ].map((i) => (
              <li
                key={i.t}
                className="flex gap-4 rounded-xl border border-border bg-background/50 p-4"
              >
                <i.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-glow" />
                <div>
                  <p className="font-medium">{i.t}</p>
                  <p className="text-sm text-muted-foreground">{i.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section id="get-started" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-primary/40 p-12 text-center shadow-glow">
          <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
          <div className="relative">
            <h2 className="text-3xl font-semibold sm:text-5xl">Ship with less overhead.</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Create a free account and set up your maintenance workspace.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <PrimaryCta />
              <Button variant="glass" size="xl" asChild>
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>Build. Review. Ship. © {new Date().getFullYear()} ForgePilot</p>
        </div>
      </footer>
    </div>
  );
}

/** Illustrative product preview built in code; labeled as a mockup. */
function ProductMockup() {
  const cols = [
    { name: "Todo", items: ["Upgrade CI to Node 22", "Triage stale issues"] },
    { name: "In Progress", items: ["Refactor config loader"] },
    { name: "Review", items: ["Draft v1.4 release notes"] },
  ];
  return (
    <figure className="relative mx-auto mt-16 max-w-5xl text-left">
      <div className="rounded-2xl border border-border bg-surface/80 p-2 shadow-glow backdrop-blur">
        <div className="flex items-center gap-1.5 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <span className="ml-3 font-mono text-xs text-muted-foreground">forgepilot / tasks</span>
        </div>
        <div className="grid gap-2 rounded-xl bg-background p-3 md:grid-cols-[1fr_1fr_1fr_1.2fr]">
          {cols.map((c) => (
            <div key={c.name} className="rounded-lg border border-border bg-surface p-3">
              <p className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <CircleDot className="h-3 w-3 text-primary-glow" /> {c.name}
              </p>
              <div className="space-y-2">
                {c.items.map((i) => (
                  <div
                    key={i}
                    className="rounded-md border border-border bg-background p-2.5 text-sm"
                  >
                    {i}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-primary/40 bg-accent/30 p-3">
            <p className="mb-3 flex items-center gap-2 text-xs font-medium text-primary-glow">
              <Bot className="h-3.5 w-3.5" /> Assistant
            </p>
            <div className="ml-auto w-fit rounded-md bg-primary/20 px-2.5 py-1.5 text-sm">
              Identify maintenance priorities
            </div>
            <div className="mt-2 rounded-md border border-border bg-background p-2.5 text-sm text-muted-foreground">
              Start with the CI upgrade — it unblocks the next two tasks…
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center font-mono text-xs text-muted-foreground">
        Illustrative mockup
      </figcaption>
    </figure>
  );
}

function HeaderAuth() {
  const session = useSession();
  if (session) {
    return (
      <Button variant="hero" size="sm" asChild>
        <Link to="/dashboard">Dashboard</Link>
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/login">Log in</Link>
      </Button>
      <Button variant="hero" size="sm" asChild>
        <Link to="/signup">Get Started</Link>
      </Button>
    </div>
  );
}

function PrimaryCta() {
  const session = useSession();
  return (
    <Button variant="hero" size="xl" asChild>
      {session ? (
        <Link to="/dashboard">
          Go to Dashboard <ArrowRight />
        </Link>
      ) : (
        <Link to="/signup">
          Get Started <ArrowRight />
        </Link>
      )}
    </Button>
  );
}
