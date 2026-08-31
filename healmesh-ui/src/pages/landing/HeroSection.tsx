import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, ShieldCheck, FileCheck, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import HeroCanvas from '../../components/three/HeroCanvas'

export default function HeroSection() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
        {/* Left Column: Human Storytelling Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 space-y-6 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-hm-teal/30 bg-hm-teal/10 text-hm-teal text-xs font-semibold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-hm-teal animate-pulse" />
            Autonomous Kubernetes Self-Healing
          </div>

          <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl heading-3d leading-[1.08]">
            Your servers broke at 3am.
            <span className="block mt-1 subheading-3d">HealMesh fixed them</span>
            before you woke up.
          </h1>

          <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
            HealMesh monitors your clusters around the clock. When something crashes,
            our Groq-powered AI diagnoses the exact root cause in plain English, and with
            your one-click approval, heals it instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="btn-primary flex items-center gap-2 text-base px-6 py-3"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="btn-ghost flex items-center gap-2 text-base px-6 py-3"
            >
              <span>See How It Works</span>
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Trust points */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-hm-emerald" />
              <span>Human Approval Required</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck size={16} className="text-hm-teal" />
              <span>Immutable Audit Logs</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-hm-amber" />
              <span>842ms Avg Diagnosis</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: 3D Holographic Server Cluster with Smart-House Info Panels */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 h-[480px] lg:h-[580px] w-full"
        >
          <HeroCanvas />
        </motion.div>
      </div>

      {/* Floating Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 text-xs pointer-events-none">
        <span>SCROLL DOWN</span>
        <ChevronDown size={14} className="animate-bounce" />
      </div>
    </section>
  )
}
