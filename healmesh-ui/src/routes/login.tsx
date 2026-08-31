import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SplineBackground } from "@/components/healmesh/SplineBackground";
import type { HealPhase } from "@/components/healmesh/mesh-data";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — HealMesh" },
      {
        name: "description",
        content:
          "Enter the mesh. Continue to your HealMesh infrastructure control center.",
      },
      { property: "og:title", content: "Sign in — HealMesh" },
      {
        property: "og:description",
        content: "Continue to your HealMesh infrastructure control center.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const sequence: { label: string; phase: HealPhase }[] = [
  { label: "AUTHENTICATING", phase: "detect" },
  { label: "VERIFYING", phase: "decide" },
  { label: "CONNECTING TO MESH", phase: "remediate" },
  { label: "● CONNECTED", phase: "verified" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(-1);
  const active = step >= 0 ? sequence[Math.min(step, sequence.length - 1)] : null;

  useEffect(() => {
    if (step < 0) return;
    if (step >= sequence.length) {
      const t = window.setTimeout(() => navigate({ to: "/dashboard" }), 450);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 700);
    return () => window.clearTimeout(t);
  }, [step, navigate]);

  return (
    <main className="grid min-h-screen lg:grid-cols-[55fr_45fr]">
      {/* Immersive Spline 3D HUD side */}
      <section className="relative hidden overflow-hidden bg-foreground p-12 text-white lg:flex lg:flex-col">
        {/* Full-bleed Spline iframe — sits beneath all content */}
        <SplineBackground />

        {/* Logo — sits above the Spline scene */}
        <Link to="/" className="relative z-10 w-fit">
          <p className="font-display text-[15px] font-bold tracking-[0.2em]">HEALMESH</p>
          <p className="eyebrow !text-[9px] mt-0.5 !text-white/45">
            Autonomous Infrastructure
          </p>
        </Link>

        {/* Center badge — optional status indicator */}
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-7 py-5 backdrop-blur-md">
            <p className="eyebrow !text-white/50 text-center mb-1">SYSTEM STATUS</p>
            <p className="font-display text-2xl font-bold tracking-widest text-white text-center">
              {active ? active.label : "● NOMINAL"}
            </p>
            <p className="eyebrow !text-[10px] !text-white/35 text-center mt-2">
              47 services monitored · 0 anomalies
            </p>
          </div>
        </div>

        {/* Footer label */}
        <div className="relative z-10 flex items-center justify-between">
          <p className="eyebrow !text-white/40">
            {active ? active.label : "Mesh stable • 47 services"}
          </p>
          <p className="eyebrow !text-white/25">Observe → Understand → Act → Heal</p>
        </div>
      </section>

      {/* Authentication side */}
      <section className="flex flex-col justify-center bg-background px-6 py-14 sm:px-14 lg:px-16">
        <div className="mx-auto w-full max-w-md animate-rise">
          <p className="eyebrow">Welcome back</p>
          <h1 className="display-lg mt-5">Enter the mesh.</h1>
          <p className="mt-5 text-muted-foreground">
            Continue to your infrastructure control center.
          </p>

          <form
            className="mt-11 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 0) setStep(0);
            }}
          >
            <Field label="Work email">
              <input
                type="email"
                required
                placeholder="you@company.com"
                className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/40"
              />
            </Field>

            <Field
              label="Password"
              aside={
                <a href="#reset" className="text-[11px] text-accent hover:underline">
                  Forgot password?
                </a>
              }
            >
              <input
                type="password"
                required
                placeholder="••••••••••••"
                className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/40"
              />
            </Field>

            <button
              type="submit"
              disabled={step >= 0}
              className="w-full rounded-full bg-foreground px-6 py-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
            >
              {active ? active.label : "Sign in ↗"}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="eyebrow !text-[10px]">or continue with</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={() => step < 0 && setStep(0)}
            className="w-full rounded-full border border-border bg-card px-6 py-4 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Continue with Google
          </button>

          <p className="mt-10 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="#access" className="text-foreground underline underline-offset-4">
              Request access
            </a>
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-1">
            <p className="eyebrow !text-[10px]">● Secure connection</p>
            <p className="eyebrow !text-[10px]">
              Encrypted session • Audit-ready architecture
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  aside,
  children,
}: {
  label: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between pb-2">
        <span className="eyebrow !text-[10px]">{label}</span>
        {aside}
      </span>
      {children}
    </label>
  );
}
