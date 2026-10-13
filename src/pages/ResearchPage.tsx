import { useState } from 'react'
import {
  FlaskConical, AlertTriangle, Info, BarChart2,
  BookOpen, ChevronDown, ChevronUp
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { SYNTHETIC_EXAMPLES } from '../data/syntheticExamples'
import { runAnalysisPipeline } from '../services/analysisOrchestrator'
import { RiskCategory, EvaluationSample } from '../types'
import { INITIAL_STAGES } from '../services/analysisOrchestrator'

// Synthetic evaluation dataset — clearly labeled as DEMO/FICTIONAL
const EVAL_SAMPLES: EvaluationSample[] = SYNTHETIC_EXAMPLES.map((ex, i) => ({
  id: ex.id,
  text: ex.input.text,
  trueLabel: i === 4 ? 'potentially_harmful' : i === 0 ? 'threat_urgent' : i === 3 ? 'threat_urgent' : i === 1 ? 'possibly_harmful' as RiskCategory : 'potentially_harmful',
  language: (ex.input.language as any) ?? 'english',
  source: 'synthetic',
}))

interface Metrics {
  tp: number; fp: number; tn: number; fn: number
  precision: number; recall: number; f1: number; accuracy: number
}

function calcMetrics(preds: RiskCategory[], trues: RiskCategory[]): Metrics {
  const HARMFUL = new Set<RiskCategory>(['potentially_harmful', 'possible_harassment', 'threat_urgent'])
  let tp = 0, fp = 0, tn = 0, fn = 0
  preds.forEach((p, i) => {
    const predHarm = HARMFUL.has(p)
    const trueHarm = HARMFUL.has(trues[i])
    if (predHarm && trueHarm) tp++
    else if (predHarm && !trueHarm) fp++
    else if (!predHarm && !trueHarm) tn++
    else fn++
  })
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0
  const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0
  const accuracy = (tp + tn) / preds.length
  return { tp, fp, tn, fn, precision, recall, f1, accuracy }
}

function MetricCard({ label, value, desc }: { label: string; value: number; desc: string }) {
  return (
    <div className="card-sm p-4 text-center">
      <p className="text-2xl font-bold text-blue-600">{(value * 100).toFixed(1)}%</p>
      <p className="text-sm font-semibold text-slate-700 mt-1">{label}</p>
      <p className="text-xs text-slate-400 mt-1 leading-tight">{desc}</p>
    </div>
  )
}

const METHOD_SECTIONS = [
  {
    title: 'Rule-Based Baseline',
    content: `The baseline uses a multilingual lexicon of pattern-matched expressions in English, Singlish (Sinhala 
    written in Latin script), and Sinhala Unicode. Patterns are organized by indicator category (threats, insults, 
    sexual harassment, doxxing, etc.) and severity level. Pattern matching uses case-insensitive regular expressions.
    No trained model is used — the system is fully transparent and auditable.`,
  },
  {
    title: 'Language Detection',
    content: `Language is detected using script-ratio analysis (Unicode character ranges) combined with Singlish 
    vocabulary detection. Sinhala Unicode occupies U+0D80–U+0DFF. Singlish patterns are detected via a curated 
    vocabulary list. Confidence is reported as low/medium/high based on script ratios.`,
  },
  {
    title: 'Risk Categorisation',
    content: `Risk is assessed using a rule-based decision tree based on indicator count, severity distribution, 
    threat/doxxing/sexual-harassment flags, and repetition signals from multi-message context. 
    The output is a categorical label (not a probability) with explicit evidence-strength reporting.`,
  },
  {
    title: 'Limitations',
    content: `The lexicon does not cover all culturally specific Sinhala or Singlish expressions. False positives 
    are possible for friendly banter, reclaimed language, and metaphorical speech. False negatives are possible 
    when harmful intent is implied rather than explicit. This system does not replace human judgment.`,
  },
]

export default function ResearchPage() {
  const [runningEval, setRunningEval] = useState(false)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [predResults, setPredResults] = useState<{ id: string; pred: RiskCategory; true_: RiskCategory; text: string }[]>([])

  const runEvaluation = async () => {
    setRunningEval(true)
    setMetrics(null)
    const preds: RiskCategory[] = []
    const results: typeof predResults = []

    for (const sample of EVAL_SAMPLES) {
      const result = await runAnalysisPipeline(
        { text: sample.text, language: sample.language },
        () => {}
      )
      preds.push(result.riskAssessment.category)
      results.push({
        id: sample.id,
        pred: result.riskAssessment.category,
        true_: sample.trueLabel,
        text: sample.text.slice(0, 80),
      })
    }

    const trues = EVAL_SAMPLES.map(s => s.trueLabel)
    setMetrics(calcMetrics(preds, trues))
    setPredResults(results)
    setRunningEval(false)
  }

  const confusionData = metrics ? [
    { name: 'True Positive', value: metrics.tp, color: '#22c55e' },
    { name: 'False Positive', value: metrics.fp, color: '#f97316' },
    { name: 'True Negative', value: metrics.tn, color: '#3b82f6' },
    { name: 'False Negative', value: metrics.fn, color: '#ef4444' },
  ] : []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <FlaskConical size={26} className="text-indigo-500" /> Research & Evaluation
        </h1>
        <p className="text-slate-500 text-sm">
          Research dashboard demonstrating the detection methodology and evaluation workflow.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800">
        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-amber-500" />
        <div>
          <strong>Important:</strong> All evaluation samples below are <strong>synthetic and fictional</strong>.
          They are clearly labeled as demonstration data and do not represent real incidents or validated research findings.
          Evaluation metrics on this page are computed on fictional data and must not be cited as real accuracy figures.
        </div>
      </div>

      {/* Methodology */}
      <section aria-labelledby="methodology-heading" className="mb-8">
        <h2 id="methodology-heading" className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-500" /> Detection Methodology
        </h2>
        <div className="space-y-3">
          {METHOD_SECTIONS.map(({ title, content }) => {
            const isOpen = expanded === title
            return (
              <div key={title} className="card-sm overflow-hidden">
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                  onClick={() => setExpanded(isOpen ? null : title)}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-slate-800">{title}</span>
                  {isOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {content}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Evaluation */}
      <section aria-labelledby="eval-heading" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 id="eval-heading" className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart2 size={18} className="text-indigo-500" /> Evaluation on Synthetic Dataset
          </h2>
          <button
            onClick={runEvaluation}
            disabled={runningEval}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {runningEval ? 'Running…' : 'Run Evaluation'}
          </button>
        </div>

        <div className="card-sm p-4 mb-4 bg-indigo-50 border-indigo-100 text-xs text-indigo-700 flex items-start gap-2">
          <Info size={13} className="flex-shrink-0 mt-0.5" />
          <span>
            Evaluation runs the full local analysis pipeline on {EVAL_SAMPLES.length} fictional samples with manually assigned ground-truth labels.
            Binary classification: "harmful" (any non-zero risk) vs "not harmful".
          </span>
        </div>

        {metrics && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <MetricCard label="Precision" value={metrics.precision} desc="Of predicted harmful, how many were correct" />
              <MetricCard label="Recall" value={metrics.recall} desc="Of actual harmful, how many were detected" />
              <MetricCard label="F1 Score" value={metrics.f1} desc="Harmonic mean of precision and recall" />
              <MetricCard label="Accuracy" value={metrics.accuracy} desc="Overall correct classifications" />
            </div>

            <div className="card-lg p-5 mb-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Confusion Matrix (Synthetic Data)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={confusionData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [v, 'Count']} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {confusionData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                {confusionData.map(d => (
                  <div key={d.name} className="text-center text-xs">
                    <span className="inline-block w-3 h-3 rounded mr-1" style={{ backgroundColor: d.color }} />
                    {d.name}: <strong>{d.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-lg p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Per-Sample Results (Synthetic)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 text-slate-500 font-medium">Sample</th>
                      <th className="text-left py-2 text-slate-500 font-medium">True</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Predicted</th>
                      <th className="text-left py-2 text-slate-500 font-medium">Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predResults.map(r => (
                      <tr key={r.id} className="border-b border-slate-50">
                        <td className="py-2 text-slate-600 max-w-[200px] truncate">{r.text}…</td>
                        <td className="py-2 text-slate-600">{r.true_}</td>
                        <td className="py-2 text-slate-600">{r.pred}</td>
                        <td className="py-2">
                          {r.pred === r.true_
                            ? <span className="text-green-600 font-medium">✓</span>
                            : <span className="text-red-500 font-medium">✗</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Class imbalance note */}
      <section className="card-sm p-5 bg-slate-50">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Class Imbalance & Dataset Notes</h2>
        <ul className="text-xs text-slate-500 space-y-1.5 leading-relaxed">
          <li>• Real cyberbullying datasets often have significant class imbalance (many more non-harmful examples).</li>
          <li>• The synthetic demonstration dataset above is balanced for illustration only.</li>
          <li>• Sinhala and Singlish lexicon coverage is limited — more research samples needed.</li>
          <li>• This tool has not been validated on real Sri Lankan user data. Any deployment in a real research context requires ethical approval and informed consent.</li>
          <li>• The evaluation framework here is designed to be replaced with real annotated data when available.</li>
        </ul>
      </section>
    </div>
  )
}
