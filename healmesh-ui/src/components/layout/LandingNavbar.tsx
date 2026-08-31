import { Hexagon, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LandingNavbar() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/[0.06] bg-[#0A1628]/75 backdrop-blur-xl">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <Hexagon size={24} className="text-hm-teal transition-transform group-hover:scale-110" fill="rgba(0,240,255,0.15)" />
        <span className="font-display font-bold text-lg tracking-tight text-white">HealMesh</span>
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
        <button onClick={() => scrollTo('problem')} className="hover:text-white transition-colors">
          The Problem
        </button>
        <button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition-colors">
          How It Works
        </button>
        <button onClick={() => scrollTo('demo')} className="hover:text-white transition-colors">
          Live Demo
        </button>
        <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">
          Features
        </button>
      </nav>

      {/* CTA */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="btn-primary text-xs md:text-sm flex items-center gap-2"
        >
          <span>Open Dashboard</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </header>
  )
}
