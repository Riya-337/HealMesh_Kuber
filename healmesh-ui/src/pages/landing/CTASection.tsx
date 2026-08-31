import { ArrowRight, Terminal, Github, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTASection() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 relative">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-50" />

      <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
        <h2 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl heading-3d leading-tight">
          Your infrastructure deserves to{' '}
          <span className="block mt-1 subheading-3d">heal itself.</span>
        </h2>

        <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto">
          Start diagnosing and auto-remediating Kubernetes outages safely with Groq Llama 3.1
          and zero unapproved mutations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="btn-primary text-base px-8 py-3.5 flex items-center gap-2"
          >
            <span>Launch HealMesh Dashboard</span>
            <ArrowRight size={16} />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost text-base px-6 py-3.5 flex items-center gap-2"
          >
            <Github size={18} />
            <span>GitHub Repository</span>
          </a>
        </div>

        {/* Tech Stack Bar */}
        <div className="pt-12 border-t border-white/10 mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-white/40 font-mono">
          <span>Go 1.22 Watcher</span>
          <span>·</span>
          <span>Python 3.11 FastAPI</span>
          <span>·</span>
          <span>Groq Llama 3.1</span>
          <span>·</span>
          <span>PostgreSQL 16</span>
          <span>·</span>
          <span>React 18 + Three.js</span>
        </div>

        <div className="text-xs text-white/30 pt-4">
          © 2026 HealMesh. Built for resilience and safe autonomous operations.
        </div>
      </div>
    </section>
  )
}
