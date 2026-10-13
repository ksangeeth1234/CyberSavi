import { Link } from 'react-router-dom'
import {
  Shield, Lock, Search, ArrowRight, BookOpen,
  ChevronRight, Globe, AlertTriangle, CheckCircle,
  FileText, Users, Zap
} from 'lucide-react'
import SriLankaMap from '../components/map/SriLankaMap'
import { INITIAL_STAGES } from '../services/analysisOrchestrator'

const FEATURE_CARDS = [
  {
    icon: Lock,
    title: 'Private by Design',
    description: 'Your messages are analysed locally in your browser. Nothing is sent to a remote server by default.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: FileText,
    title: 'Evidence Support',
    description: 'Organise, annotate, and export evidence securely — with optional integrity checksums using Web Crypto.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
  {
    icon: CheckCircle,
    title: 'Safe Next Steps',
    description: 'Receive personalised, actionable recommendations including official Sri Lankan reporting channels.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
]

const PIPELINE_ICONS = [Search, Lock, Globe, AlertTriangle, Users, BarChart, Zap, FileText]

import { BarChart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="gradient-hero border-b border-slate-100 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-200/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-200">
                <Shield size={12} /> Research Application · Sri Lanka
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 leading-tight mb-5">
                Understand Online Harm.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                  Protect Your Digital Wellbeing.
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                SafeSpace LK uses privacy-first NLP to help you analyse potentially harmful messages,
                organise evidence, and understand your options — in Sinhala, Singlish, English, or mixed language.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-blue-200 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Search size={18} /> Analyse a Message
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
                >
                  <BookOpen size={18} /> How It Works
                </a>
              </div>

              {/* Privacy statement */}
              <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
                <Lock size={16} className="flex-shrink-0 mt-0.5 text-green-600" />
                <div>
                  <span className="font-semibold">Privacy First: </span>
                  Message text is processed locally in your browser. No data is stored on our servers.
                </div>
              </div>
            </div>

            {/* Right — Map */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 text-xs font-medium text-slate-700 border border-slate-100 z-10">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                Local Processing Active
              </div>
              <SriLankaMap />
              <p className="text-xs text-center text-slate-400 mt-2 italic">
                Illustrative research map — markers represent simulated data, not real incidents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section aria-labelledby="features-heading" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="features-heading" className="text-3xl font-bold text-slate-900 mb-3">
              Designed for Your Safety
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Built around Sri Lankan users and multilingual online communication.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURE_CARDS.map(({ icon: Icon, title, description, color, bg, border }) => (
              <article
                key={title}
                className={`card-lg p-6 border ${border} transition-all hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" aria-labelledby="pipeline-heading" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="pipeline-heading" className="text-3xl font-bold text-slate-900 mb-3">
              How the Analysis Works
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              A transparent, explainable pipeline — every step runs locally in your browser.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INITIAL_STAGES.map((stage, i) => {
              const Icon = PIPELINE_ICONS[i] ?? Search
              return (
                <article key={stage.id} className="card-sm p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={15} />
                    </div>
                    <span className="text-xs font-bold text-blue-400">Step {i + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">{stage.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{stage.description}</p>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-md shadow-blue-200 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Start Analysis <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className="py-10 bg-amber-50 border-y border-amber-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-amber-700 font-semibold mb-2 text-sm">
            <AlertTriangle size={16} /> Important Disclaimer
          </div>
          <p className="text-amber-900 text-sm leading-relaxed">
            SafeSpace LK is a research tool designed to support assessment. It does not make definitive
            legal or psychological judgements. Automated text analysis can make mistakes — always seek
            professional advice for serious situations. If you are in immediate danger, contact emergency
            services (119 in Sri Lanka) immediately.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to analyse a message?</h2>
          <p className="text-slate-500 mb-8">
            Private. Local. Explainable. Supports Sinhala, Singlish, English, and mixed language.
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-xl shadow-lg shadow-blue-200 text-lg transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            Get Started <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
