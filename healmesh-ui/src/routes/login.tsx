import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SplineBackground } from "@/components/healmesh/SplineBackground";
import type { HealPhase } from "@/components/healmesh/mesh-data";
import { useAuthStore } from "@/hooks/useAuthStore";
import { ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

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
  { label: "VERIFYING CREDENTIALS", phase: "decide" },
  { label: "CONNECTING TO MESH", phase: "remediate" },
  { label: "● ACCESS GRANTED", phase: "verified" },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login, signup, switchUser, users } = useAuthStore();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("riya@healmesh.io");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [step, setStep] = useState(-1);
  const active = step >= 0 ? sequence[Math.min(step, sequence.length - 1)] : null;

  useEffect(() => {
    if (step < 0) return;
    if (step >= sequence.length) {
      const t = window.setTimeout(() => navigate({ to: "/dashboard" }), 450);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 600);
    return () => window.clearTimeout(t);
  }, [step, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (mode === "signin") {
      const res = login(email);
      if (!res.success) {
        setErrorMsg(res.message || "Failed to sign in.");
        return;
      }
      if (step < 0) setStep(0);
    } else {
      if (!name.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      const res = signup(name, email);
      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }
      setSuccessMsg(res.message);
      setMode("signin");
    }
  };

  const handleAdminQuickLogin = () => {
    const admin = users.find((u) => u.role === "ADMIN");
    if (admin) {
      switchUser(admin);
      setEmail(admin.email);
      setStep(0);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[55fr_45fr]">
      {/* Immersive Spline 3D HUD side */}
      <section className="relative hidden overflow-hidden bg-foreground p-12 text-white lg:flex lg:flex-col">
        <SplineBackground />

        {/* Logo */}
        <Link to="/" className="relative z-10 w-fit">
          <p className="font-display text-[15px] font-bold tracking-[0.2em]">HEALMESH</p>
          <p className="eyebrow !text-[9px] mt-0.5 !text-white/45">
            Autonomous Infrastructure
          </p>
        </Link>

        {/* Center badge */}
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-7 py-5 backdrop-blur-md text-center max-w-md">
            <p className="eyebrow !text-white/50 mb-1">ACCESS GATEWAY</p>
            <p className="font-display text-2xl font-bold tracking-widest text-white">
              {active ? active.label : "● CLUSTER PROTECTED"}
            </p>
            <p className="eyebrow !text-[10px] !text-white/45 mt-2">
              Primary Administrator: <span className="text-cyan-300 font-semibold">Riya Aggarwal</span>
            </p>
          </div>
        </div>

        {/* Footer label */}
        <div className="relative z-10 flex items-center justify-between">
          <p className="eyebrow !text-white/40">
            {active ? active.label : "Role-Based Access • Human Gate Enforced"}
          </p>
          <p className="eyebrow !text-white/25">Observe → Understand → Act → Heal</p>
        </div>
      </section>

      {/* Authentication side */}
      <section className="flex flex-col justify-center bg-background px-6 py-14 sm:px-14 lg:px-16">
        <div className="mx-auto w-full max-w-md animate-rise">
          <div className="flex items-center justify-between">
            <p className="eyebrow">{mode === "signin" ? "Operator Portal" : "New Account Request"}</p>
            <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`px-3 py-1 rounded-full transition-all ${
                  mode === "signin" ? "bg-foreground text-primary-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`px-3 py-1 rounded-full transition-all ${
                  mode === "signup" ? "bg-foreground text-primary-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <h1 className="display-lg mt-5">
            {mode === "signin" ? "Enter the mesh." : "Request Access."}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to access your Kubernetes cluster control center."
              : "New accounts require manual authorization from Admin (Riya Aggarwal)."}
          </p>

          {/* Quick Admin Access Button */}
          <div className="mt-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-cyan-500" />
                <span>Primary Admin Access</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Riya Aggarwal (Lead SRE · Full Approver Rights)
              </p>
            </div>
            <button
              type="button"
              onClick={handleAdminQuickLogin}
              className="px-3 py-1.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
            >
              Sign In as Riya ↗
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-300">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <Field label="Full Name">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="w-full rounded-2xl border border-border bg-card px-5 py-3.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/40"
                />
              </Field>
            )}

            <Field label="Work Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-2xl border border-border bg-card px-5 py-3.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/40"
              />
            </Field>

            <Field
              label="Password"
              aside={
                mode === "signin" ? (
                  <span className="text-[11px] text-muted-foreground">Demo auth active</span>
                ) : undefined
              }
            >
              <input
                type="password"
                required
                placeholder="••••••••••••"
                className="w-full rounded-2xl border border-border bg-card px-5 py-3.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/40"
              />
            </Field>

            <button
              type="submit"
              disabled={step >= 0}
              className="w-full rounded-full bg-foreground px-6 py-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70 mt-2"
            >
              {active
                ? active.label
                : mode === "signin"
                ? "Sign in to Dashboard ↗"
                : "Submit Sign-Up for Riya's Approval ↗"}
            </button>
          </form>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-1">
            <p className="eyebrow !text-[10px]">● Human Approval Gate</p>
            <p className="eyebrow !text-[10px]">
              Only Riya Aggarwal can authorize mutations
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
      <span className="flex items-center justify-between pb-1.5">
        <span className="eyebrow !text-[10px]">{label}</span>
        {aside}
      </span>
      {children}
    </label>
  );
}
