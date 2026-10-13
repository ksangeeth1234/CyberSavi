import { useLocation, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle, CheckCircle2, Shield, ChevronDown, ChevronUp,
  Download, FileText, Printer, Search, FolderOpen,
  ExternalLink, Check, ArrowRight, Lock, Globe, Info
} from 'lucide-react'
import type { AnalysisResult, Recommendation } from '../types'
import { loadAnalysisSession } from '../services/privacyManager'
import { generatePDF, generatePNG, printReport } from '../services/reportGenerator'
import { CATEGORY_META } from '../data/lexicons'
import PipelineViz from '../components/visualizations/PipelineViz'

const RISK_ICON: Record<string, typeof CheckCircle2> = {
  no_indicators: CheckCircle2,
  potentially_harmful: AlertTriangle,
  possible_harassment: AlertTriangle,
  threat_urgent: Shield,
  insufficient: Info,
}

function RiskBadge({ result }: { result: AnalysisResult }) {
  const { riskAssessment } = result
  const Icon = RISK_ICON[riskAssessment.category] ?? Info
  return (
    <div
      className="rounded-2xl p-6 text-white"
      style={{ background: `linear-gradient(135deg, ${riskAssessment.color}dd, ${riskAssessment.color})` }}
      role="status"
      aria-label={`Risk assessment: ${riskAssessment.label}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Risk Assessment</p>
          <h2 className="text-xl font-bold leading-tight mb-2">{riskAssessment.label}</h2>
          <p className="text-white/80 text-sm leading-relaxed">{riskAssessment.explanation}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-medium">
              Evidence Strength: <strong>{riskAssessment.evidenceStrength.toUpperCase()}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-medium">
              {riskAssessment.indicatorCount} Indicator(s) Detected
            </span>
            {riskAssessment.immediateAction && (
              <span className="inline-flex items-center gap-1.5 bg-red-400/30 border border-red-300/40 rounded-lg px-3 py-1.5 text-xs font-bold">
                ⚠ Immediate Safety Guidance Below
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function IndicatorCard({ indicator }: { indicator: AnalysisResult['indicators'][0] }) {
  const [expanded, setExpanded] = useState(false)
  const meta = CATEGORY_META[indicator.category]
  const severityColor = { high: 'bg-red-50 border-red-200 text-red-700', medium: 'bg-amber-50 border-amber-200 text-amber-700', low: 'bg-slate-50 border-slate-200 text-slate-600' }

  return (
    <article className={`border rounded-xl overflow-hidden transition-all`}>
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${severityColor[indicator.severity].split(' ').slice(0, 2).join(' ')}`}>
          <AlertTriangle size={14} className={severityColor[indicator.severity].split(' ')[2]} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800">{indicator.label}</span>
            <span className={`badge ${severityColor[indicator.severity]}`}>
              {indicator.severity}
            </span>
            <span className="text-xs text-slate-400">{meta?.label}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">"{indicator.excerpt}"</p>
        </div>
        {expanded ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Excerpt</p>
            <p className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-700 break-all">
              "{indicator.excerpt}"
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Why It May Matter</p>
            <p className="text-xs text-slate-600 leading-relaxed">{indicator.whyItMatters}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Alternative Interpretations</p>
            <ul className="space-y-1">
              {indicator.alternativeInterpretations.map((alt, i) => (
                <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                  <span className="text-blue-400 flex-shrink-0 mt-0.5">•</span> {alt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  )
}

function RecommendationItem({ rec, onToggle }: { rec: Recommendation; onToggle: () => void }) {
  const priorityColor = {
    immediate: 'bg-red-50 border-red-200',
    soon: 'bg-amber-50 border-amber-200',
    general: 'bg-slate-50 border-slate-200',
  }

  return (
    <div className={`border rounded-xl p-4 ${priorityColor[rec.priority]} transition-all`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center mt-0.5 transition-all ${
            rec.completed ? 'bg-green-500 border-green-500' : 'border-slate-300 bg-white hover:border-blue-400'
          }`}
          aria-label={rec.completed ? `Mark "${rec.title}" as incomplete` : `Mark "${rec.title}" as complete`}
          role="checkbox"
          aria-checked={rec.completed}
        >
          {rec.completed && <Check size={11} className="text-white" />}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold ${rec.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
              {rec.title}
            </p>
            <span className={`badge text-xs font-medium ${
              rec.priority === 'immediate' ? 'bg-red-100 text-red-700' :
              rec.priority === 'soon' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {rec.priority}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rec.description}</p>
          {rec.externalUrl && (
            <a
              href={rec.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2 underline underline-offset-2"
              onClick={(e) => {
                if (!window.confirm(`You are about to visit ${rec.externalUrl}. Continue?`)) e.preventDefault()
              }}
            >
              Visit resource <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const location = useLocation()
  const reportRef = useRef<HTMLDivElement>(null)
  const [result, setResult] = useState<AnalysisResult | null>(
    (location.state as any)?.result ?? null
  )
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!result) {
      const saved = loadAnalysisSession()
      if (saved) setResult(saved)
    }
  }, [])

  useEffect(() => {
    if (result) setRecs(result.recommendations.map(r => ({ ...r })))
  }, [result])

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Search size={48} className="mx-auto text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 mb-3">No Analysis Results Yet</h1>
        <p className="text-slate-500 mb-6">Analyse a message to see results here.</p>
        <Link to="/analyze" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
          <Search size={16} /> Analyse a Message
        </Link>
      </div>
    )
  }

  const toggleRec = (id: string) => {
    setRecs(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r))
  }

  const handlePDF = async () => {
    setExporting(true)
    try {
      await generatePDF(result, {
        selectedEvidence: [],
        includeChecklist: true,
        recommendations: recs,
      })
    } finally { setExporting(false) }
  }

  const handlePNG = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try { await generatePNG(reportRef.current) }
    finally { setExporting(false) }
  }

  const immediateRecs = recs.filter(r => r.priority === 'immediate')
  const soonRecs = recs.filter(r => r.priority === 'soon')
  const generalRecs = recs.filter(r => r.priority === 'general')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" ref={reportRef}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Analysis Results</h1>
          <p className="text-sm text-slate-500">
            <Lock size={12} className="inline mr-1" />
            Processed locally · {new Date(result.timestamp).toLocaleString('en-LK')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <button onClick={handlePDF} disabled={exporting} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            <Download size={14} /> PDF
          </button>
          <button onClick={handlePNG} disabled={exporting} className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            <FileText size={14} /> PNG
          </button>
          <button onClick={() => reportRef.current && printReport(reportRef.current)} className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Printer size={14} /> Print
          </button>
          <Link to="/evidence" state={{ result }} className="flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <FolderOpen size={14} /> Evidence
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk */}
          <RiskBadge result={result} />

          {/* Language */}
          <div className="card-lg p-5">
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Globe size={16} className="text-blue-500" /> Language Analysis
            </h2>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Detected</p>
                <p className="font-semibold text-slate-700 capitalize">{result.languageAnalysis.detected}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Confidence</p>
                <p className="font-semibold text-slate-700 capitalize">{result.languageAnalysis.confidence}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Scripts</p>
                <p className="font-semibold text-slate-700">{result.languageAnalysis.scripts.join(', ') || 'Unknown'}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">{result.languageAnalysis.mixDetails}</p>
          </div>

          {/* Indicators */}
          <div className="card-lg p-5">
            <h2 className="text-base font-semibold text-slate-800 mb-3">
              Detected Linguistic Indicators ({result.indicators.length})
            </h2>
            {result.indicators.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={36} className="mx-auto text-green-400 mb-2" />
                <p className="text-sm text-slate-500">No significant linguistic indicators were detected.</p>
                <p className="text-xs text-slate-400 mt-1">This does not mean the message is harmless — context matters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.indicators.map(ind => <IndicatorCard key={ind.id} indicator={ind} />)}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="card-lg p-5">
            <h2 className="text-base font-semibold text-slate-800 mb-1">What Should I Do Next?</h2>
            <p className="text-xs text-slate-400 mb-4">Mark steps as completed as you take them.</p>
            {immediateRecs.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Immediate</h3>
                <div className="space-y-2">{immediateRecs.map(r => <RecommendationItem key={r.id} rec={r} onToggle={() => toggleRec(r.id)} />)}</div>
              </div>
            )}
            {soonRecs.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Soon</h3>
                <div className="space-y-2">{soonRecs.map(r => <RecommendationItem key={r.id} rec={r} onToggle={() => toggleRec(r.id)} />)}</div>
              </div>
            )}
            {generalRecs.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">General</h3>
                <div className="space-y-2">{generalRecs.map(r => <RecommendationItem key={r.id} rec={r} onToggle={() => toggleRec(r.id)} />)}</div>
              </div>
            )}
          </div>

          {/* Limitations */}
          <div className="card-sm p-5 bg-amber-50 border-amber-100">
            <h2 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <AlertTriangle size={15} /> Analysis Limitations
            </h2>
            <ul className="space-y-1.5">
              {result.riskAssessment.limitations.map((lim, i) => (
                <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                  <span className="flex-shrink-0 mt-0.5">•</span> {lim}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">{result.disclaimer}</p>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1 space-y-5">
          <div className="card-lg p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Pipeline Summary</h2>
            <PipelineViz stages={result.pipelineStages} />
          </div>

          <div className="card-lg p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Actions</h2>
            <div className="space-y-2">
              <Link to="/analyze" className="flex items-center justify-between w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium px-4 py-3 rounded-xl border border-slate-200 transition-colors">
                <span className="flex items-center gap-2"><Search size={14} /> New Analysis</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/evidence" state={{ result }} className="flex items-center justify-between w-full bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-medium px-4 py-3 rounded-xl border border-violet-200 transition-colors">
                <span className="flex items-center gap-2"><FolderOpen size={14} /> Add to Evidence</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
