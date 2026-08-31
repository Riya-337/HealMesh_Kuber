import { createFileRoute, Link } from "@tanstack/react-router";
import { MeshVisual } from "@/components/healmesh/MeshVisual";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HealMesh — Infrastructure that heals itself" },
      {
        name: "description",
        content:
          "HealMesh connects AI agents, observability, automation and human approval into one self-healing infrastructure mesh.",
      },
      { property: "og:title", content: "HealMesh — Infrastructure that heals itself" },
      {
        property: "og:description",
        content:
          "Autonomous detection, decision and recovery for enterprise infrastructure, with human approval built in.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <SiteHeader />
      <Hero />
      <RespondSection />
      <LifecycleSection />
      <OneMeshSection />
      <ControlSection />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}

function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-7 md:px-12">
      <div>
        <p className="font-display text-[15px] font-bold tracking-[0.2em]">HEALMESH</p>
        <p className="eyebrow !text-[9px] mt-0.5">Autonomous Infrastructure</p>
      </div>
      <nav className="hidden items-center gap-9 text-sm text-muted-foreground md:flex">
        <a className="transition-colors hover:text-foreground" href="#respond">
          Platform
        </a>
        <a className="transition-colors hover:text-foreground" href="#lifecycle">
          Lifecycle
        </a>
        <a className="transition-colors hover:text-foreground" href="#control">
          Control
        </a>
      </nav>
      <Link
        to="/login"
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Enter HealMesh ↗
      </Link>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-[1400px] items-center gap-14 px-6 pb-24 pt-10 md:px-12 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
      <div className="animate-rise">
        <p className="eyebrow">Autonomous Infrastructure • AI-Powered</p>
        <h1 className="display-xl mt-7">
          Infrastructure
          <br />
          that heals itself.
        </h1>
        <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
          HealMesh connects AI agents, observability, automation and human approval
          into one self-healing infrastructure mesh.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/login"
            className="rounded-full bg-foreground px-7 py-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Enter HealMesh ↗
          </Link>
          <a
            href="#one-mesh"
            className="rounded-full border border-border bg-card px-7 py-4 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Explore the Architecture
          </a>
        </div>

        <dl className="mt-14 flex flex-wrap gap-x-12 gap-y-5">
          <StatusStat label="● Systems Operational" value="Live" />
          <StatusStat label="Services Monitored" value="47" />
          <StatusStat label="Health Score" value="99.97%" />
        </dl>
      </div>

      <div className="relative">
        <MeshVisual className="mx-auto max-w-[560px] text-foreground" />
      </div>
    </section>
  );
}

function StatusStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="font-display text-2xl font-medium">{value}</dd>
      <dt className="eyebrow !text-[10px] mt-1">{label}</dt>
    </div>
  );
}

const respondCards = [
  {
    index: "01",
    kicker: "Detect",
    title: "See the problem before it spreads.",
    body: "HealMesh continuously monitors infrastructure signals, service health, logs and operational behavior to identify anomalies and incidents.",
    lines: ["Service anomaly detected", "Latency spike", "Dependency failure"],
    tones: ["var(--critical)", "var(--warning)", "var(--warning)"],
  },
  {
    index: "02",
    kicker: "Decide",
    title: "Turn signals into decisions.",
    body: "AI agents investigate incidents, correlate evidence and determine the safest remediation path.",
    lines: ["Incident", "AI agent", "Evidence", "Recommended action"],
    tones: [
      "var(--critical)",
      "var(--indigo-electric)",
      "var(--cyan-muted)",
      "var(--healthy)",
    ],
  },
  {
    index: "03",
    kicker: "Heal",
    title: "Recover without the scramble.",
    body: "Automated workflows execute approved remediation actions, verify recovery and record every step.",
    lines: ["Incident", "Remediation", "Verified"],
    tones: ["var(--critical)", "var(--indigo-electric)", "var(--healthy)"],
  },
];

function RespondSection() {
  return (
    <section id="respond" className="mx-auto max-w-[1400px] px-6 py-24 md:px-12">
      <h2 className="display-lg max-w-2xl">
        When systems drift,
        <br />
        HealMesh responds.
      </h2>
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {respondCards.map((card) => (
          <article key={card.index} className="panel hover-lift flex flex-col p-8">
            <p className="eyebrow">
              {card.index} / {card.kicker}
            </p>
            <h3 className="display-md mt-6 !text-[1.55rem]">{card.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {card.body}
            </p>
            <ul className="mt-8 space-y-2.5 border-t border-border pt-6">
              {card.lines.map((line, i) => (
                <li key={line} className="flex items-center gap-3 text-[13px]">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: card.tones[i] }}
                  />
                  <span className="text-muted-foreground">{line}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

const lifecycle = [
  { n: "01", label: "Detect", body: "Signals, telemetry and behavior are evaluated continuously." },
  { n: "02", label: "Understand", body: "Context is assembled from logs, metrics and dependencies." },
  { n: "03", label: "Decide", body: "Agents select the safest remediation path with evidence." },
  { n: "04", label: "Remediate", body: "Approved workflows execute against the infrastructure." },
  { n: "05", label: "Verify", body: "Recovery is confirmed against baseline and recorded." },
];

function LifecycleSection() {
  return (
    <section id="lifecycle" className="mx-auto max-w-[1400px] px-6 py-24 md:px-12">
      <h2 className="display-lg">
        From incident
        <br />
        to recovery.
      </h2>
      <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-5">
        {lifecycle.map((step) => (
          <li
            key={step.n}
            className="group bg-card p-7 transition-colors hover:bg-secondary"
          >
            <p className="font-display text-3xl font-medium text-muted-foreground transition-colors group-hover:text-accent">
              {step.n}
            </p>
            <p className="eyebrow mt-6 !text-foreground">{step.label}</p>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function OneMeshSection() {
  return (
    <section id="one-mesh" className="mx-auto max-w-[1400px] px-6 py-24 md:px-12">
      <div className="panel-dark relative overflow-hidden px-8 py-14 md:px-14">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="eyebrow !text-white/45">Architecture</p>
            <h2 className="display-lg mt-6 text-white">
              One mesh.
              <br />
              Every layer.
            </h2>
            <p className="mt-7 max-w-md text-white/60">
              Human approval, the AI gateway, specialist agents, automation and your
              infrastructure operate as one connected surface — not a stack of
              disconnected tools.
            </p>
            <ul className="mt-10 grid max-w-md gap-3 sm:grid-cols-2">
              {[
                "Human approval",
                "AI gateway",
                "Specialist agents",
                "Automation runners",
                "Infrastructure",
                "Kubernetes",
              ].map((layer) => (
                <li key={layer} className="glass px-4 py-3 text-[13px] text-white/80">
                  {layer}
                </li>
              ))}
            </ul>
          </div>
          <MeshVisual
            className="mx-auto max-w-[440px] text-white"
            interval={2600}
            faultId="workers"
            compact
          />
        </div>
      </div>
    </section>
  );
}

const controlCards = [
  {
    title: "Human in the loop",
    body: "Critical actions can require explicit approval before anything touches production.",
  },
  {
    title: "Explainable actions",
    body: "Every remediation includes the evidence, reasoning and action context behind it.",
  },
  {
    title: "Complete audit trail",
    body: "Every decision and execution is recorded, attributable and reviewable.",
  },
];

function ControlSection() {
  return (
    <section id="control" className="mx-auto max-w-[1400px] px-6 py-24 md:px-12">
      <h2 className="display-lg max-w-3xl">Autonomous doesn't mean uncontrolled.</h2>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {controlCards.map((card) => (
          <article key={card.title} className="panel hover-lift p-8">
            <span
              className="block h-8 w-8 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, var(--indigo-electric), var(--cyan-muted))",
              }}
            />
            <h3 className="display-md mt-8 !text-[1.4rem]">{card.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {card.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-28 text-center md:px-12">
      <h2 className="display-xl mx-auto max-w-4xl">
        Let your infrastructure
        <br />
        handle the incident.
      </h2>
      <p className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground">
        Build a system that doesn't just detect failure — it knows what to do next.
      </p>
      <div className="mt-11 flex flex-wrap justify-center gap-3">
        <Link
          to="/login"
          className="rounded-full bg-foreground px-8 py-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Launch HealMesh ↗
        </Link>
        <a
          href="#one-mesh"
          className="rounded-full border border-border bg-card px-8 py-4 text-sm font-medium transition-colors hover:bg-secondary"
        >
          View Architecture
        </a>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-10 md:px-12">
      <p className="font-display text-[13px] font-bold tracking-[0.2em]">HEALMESH</p>
      <p className="eyebrow !text-[10px]">
        Encrypted session • Audit-ready architecture
      </p>
    </footer>
  );
}
