import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, X, RotateCcw, Lock, Globe, ChevronDown, AlertCircle,
  Loader2, Plus, Trash2
} from 'lucide-react'
import { AnalysisInput, DetectedLanguage } from '../types'
import { SYNTHETIC_EXAMPLES } from '../data/syntheticExamples'
import { runAnalysisPipeline, INITIAL_STAGES } from '../services/analysisOrchestrator'
import { saveAnalysisSession } from '../services/privacyManager'
import { PipelineStage } from '../types'
import PipelineViz from '../components/visualizations/PipelineViz'

const LANGUAGE_OPTIONS: { value: DetectedLanguage | 'auto'; label: string }[] = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'english', label: 'English' },
  { value: 'sinhala', label: 'Sinhala (Unicode)' },
  { value: 'singlish', label: 'Singlish (Sinhala in Latin characters)' },
  { value: 'mixed', label: 'Mixed / Multilingual' },
]

const MAX_CHARS = 5000

export default function AnalysisPage() {
  const navigate = useNavigate()
  const [input, setInput] = useState<AnalysisInput>({
    text: '', platform: '', dateTime: '', context: '', language: 'auto', priorMessages: [],
  })
  const [priorMsg, setPriorMsg] = useState('')
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_STAGES.map(s => ({ ...s })))
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const charCount = [...input.text].length
  const overLimit = charCount > MAX_CHARS

  const loadSample = (idx: number) => {
    const sample = SYNTHETIC_EXAMPLES[idx]
    setInput({ ...sample.input, priorMessages: [] })
  }

  const clearAll = () => {
    setInput({ text: '', platform: '', dateTime: '', context: '', language: 'auto', priorMessages: [] })
    setStages(INITIAL_STAGES.map(s => ({ ...s })))
    setError(null)
    textareaRef.current?.focus()
  }

  const addPriorMessage = () => {
    if (!priorMsg.trim()) return
    setInput(prev => ({ ...prev, priorMessages: [...(prev.priorMessages ?? []), priorMsg.trim()] }))
    setPriorMsg('')
  }

  const removePriorMessage = (i: number) => {
    setInput(prev => ({ ...prev, priorMessages: (prev.priorMessages ?? []).filter((_, idx) => idx !== i) }))
  }

  const handleAnalyze = async () => {
    if (!input.text.trim()) { setError('Please enter a message to analyse.'); textareaRef.current?.focus(); return }
    if (overLimit) { setError(`Message exceeds ${MAX_CHARS} character limit.`); return }
    setError(null)
    setAnalyzing(true)
    setStages(INITIAL_STAGES.map(s => ({ ...s })))
    try {
      const result = await runAnalysisPipeline(input, (updated) => setStages(updated))
      saveAnalysisSession(result)
      navigate('/results', { state: { result } })
    } catch (e) {
      setError('Analysis failed unexpectedly. Please try again.')
      setAnalyzing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Analyse a Message</h1>
        <p className="text-slate-500">
          All text is processed locally in your browser.{' '}
          <span className="inline-flex items-center gap-1 text-green-600 font-medium">
            <Lock size={13} /> Private analysis
          </span>
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Left: Form ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Main text area */}
          <div className="card-lg p-6">
            <label htmlFor="message-text" className="block text-sm font-semibold text-slate-700 mb-2">
              Message Text <span className="text-red-500" aria-hidden>*</span>
            </label>
            <div className="relative">
              <textarea
                id="message-text"
                ref={textareaRef}
                value={input.text}
                onChange={e => setInput(p => ({ ...p, text: e.target.value }))}
                placeholder="Paste the message you want to analyse here…"
                rows={8}
                className={`w-full resize-y border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all font-mono leading-relaxed ${
                  overLimit ? 'border-red-300 focus:ring-red-300' : 'border-slate-200 focus:ring-blue-300'
                }`}
                aria-describedby="char-counter"
                aria-invalid={overLimit}
                disabled={analyzing}
              />
              {input.text && (
                <button
                  onClick={clearAll}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Clear message"
                  disabled={analyzing}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span
                id="char-counter"
                className={`text-xs ${overLimit ? 'text-red-500 font-semibold' : 'text-slate-400'}`}
                aria-live="polite"
              >
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
              </span>
              <div className="flex gap-2">
                <button
                  onClick={clearAll}
                  disabled={analyzing}
                  className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                  aria-label="Clear all fields"
                >
                  <RotateCcw size={12} /> Clear all
                </button>
              </div>
            </div>

            {/* Load sample */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-slate-500 self-center">Load fictional sample:</span>
              {SYNTHETIC_EXAMPLES.slice(0, 4).map((ex, i) => (
                <button
                  key={ex.id}
                  onClick={() => loadSample(i)}
                  disabled={analyzing}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-lg transition-colors border border-slate-200"
                  title={ex.description}
                >
                  {ex.title.split(' — ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="card-lg p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Optional Context</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="platform" className="block text-xs font-medium text-slate-600 mb-1">Platform</label>
                <input
                  id="platform"
                  type="text"
                  value={input.platform ?? ''}
                  onChange={e => setInput(p => ({ ...p, platform: e.target.value }))}
                  placeholder="e.g. Facebook, WhatsApp, TikTok"
                  disabled={analyzing}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                />
              </div>
              <div>
                <label htmlFor="datetime" className="block text-xs font-medium text-slate-600 mb-1">Date & Time (optional)</label>
                <input
                  id="datetime"
                  type="datetime-local"
                  value={input.dateTime ?? ''}
                  onChange={e => setInput(p => ({ ...p, dateTime: e.target.value }))}
                  disabled={analyzing}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="context" className="block text-xs font-medium text-slate-600 mb-1">Incident Context (optional)</label>
              <textarea
                id="context"
                value={input.context ?? ''}
                onChange={e => setInput(p => ({ ...p, context: e.target.value }))}
                placeholder="Briefly describe any relevant background (e.g. prior relationship, ongoing dispute)…"
                rows={3}
                disabled={analyzing}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all resize-none"
              />
            </div>
          </div>

          {/* Language */}
          <div className="card-lg p-6">
            <label htmlFor="language" className="block text-sm font-semibold text-slate-700 mb-3">
              <Globe size={15} className="inline mr-1.5 text-blue-500" />
              Language
            </label>
            <div className="relative">
              <select
                id="language"
                value={input.language ?? 'auto'}
                onChange={e => setInput(p => ({ ...p, language: e.target.value as DetectedLanguage | 'auto' }))}
                disabled={analyzing}
                className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white transition-all"
              >
                {LANGUAGE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Auto-detect works for English and Sinhala Unicode. For Singlish, selecting it manually improves detection.
            </p>
          </div>

          {/* Prior messages (context) */}
          <div className="card-lg p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-1">Prior Messages (Optional)</h2>
            <p className="text-xs text-slate-400 mb-4">
              Adding earlier messages from the same interaction helps assess repetition and escalation.
              Include only messages that are directly relevant — avoid sharing unnecessary personal information.
            </p>
            {(input.priorMessages ?? []).map((msg, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-mono break-all">
                  {msg.slice(0, 200)}{msg.length > 200 ? '…' : ''}
                </div>
                <button
                  onClick={() => removePriorMessage(i)}
                  className="text-slate-400 hover:text-red-500 p-1 transition-colors mt-0.5"
                  aria-label={`Remove prior message ${i + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={priorMsg}
                onChange={e => setPriorMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPriorMessage()}
                placeholder="Paste a prior message and press Add…"
                disabled={analyzing}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />
              <button
                onClick={addPriorMessage}
                disabled={analyzing || !priorMsg.trim()}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Plus size={12} /> Add
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !input.text.trim() || overLimit}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-md shadow-blue-200 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-2 text-base"
            aria-busy={analyzing}
          >
            {analyzing ? (
              <><Loader2 size={20} className="animate-spin" /> Analysing…</>
            ) : (
              <><Search size={20} /> Analyse Message</>
            )}
          </button>

          <p className="text-xs text-center text-slate-400">
            <Lock size={11} className="inline mr-1" />
            Processing is local-only. Your message is never sent to a remote server.
          </p>
        </div>

        {/* ── Right: Pipeline ── */}
        <div className="lg:col-span-1">
          <div className="card-lg p-6 sticky top-20">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Analysis Pipeline</h2>
            <PipelineViz stages={stages} />
          </div>
        </div>
      </div>
    </div>
  )
}
