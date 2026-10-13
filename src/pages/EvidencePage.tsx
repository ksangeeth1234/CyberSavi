import { useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  FolderOpen, Plus, Trash2, FileText, Image, StickyNote,
  X, Download, Hash, AlertCircle, Info, Eye, EyeOff, Check
} from 'lucide-react'
import { EvidenceItem, AnalysisResult } from '../types'
import { saveEvidence, loadEvidence, generateChecksum } from '../services/privacyManager'
import { generatePDF } from '../services/reportGenerator'

function useEvidence(initial: EvidenceItem[] = []) {
  const [items, setItems] = useState<EvidenceItem[]>(() => {
    const saved = loadEvidence()
    return saved.length > 0 ? saved : initial
  })

  const add = (item: Omit<EvidenceItem, 'id' | 'addedAt'>) => {
    const newItem: EvidenceItem = {
      ...item,
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      addedAt: new Date().toISOString(),
    }
    setItems(prev => {
      const next = [...prev, newItem]
      saveEvidence(next)
      return next
    })
  }

  const remove = (id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      saveEvidence(next)
      return next
    })
  }

  const toggle = (id: string) => {
    setItems(prev => {
      const next = prev.map(i => i.id === id ? { ...i, includeInReport: !i.includeInReport } : i)
      saveEvidence(next)
      return next
    })
  }

  const clearAll = () => {
    setItems([])
    saveEvidence([])
  }

  return { items, add, remove, toggle, clearAll }
}

export default function EvidencePage() {
  const location = useLocation()
  const analysisResult = (location.state as any)?.result as AnalysisResult | undefined
  const { items, add, remove, toggle, clearAll } = useEvidence()

  const [showAdd, setShowAdd] = useState(false)
  const [addType, setAddType] = useState<'message' | 'screenshot' | 'note'>('message')
  const [form, setForm] = useState({ text: '', platform: '', dateTime: '', notes: '', context: '' })
  const [checksumMap, setChecksumMap] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-import from analysis if arriving from results
  const [autoImported, setAutoImported] = useState(false)
  if (analysisResult && !autoImported) {
    setAutoImported(true)
    if (analysisResult.input.text && !items.some(i => i.originalText === analysisResult.input.text)) {
      add({
        type: 'message',
        originalText: analysisResult.input.text,
        platform: analysisResult.input.platform,
        dateTime: analysisResult.input.dateTime,
        context: analysisResult.input.context,
        analysisFindings: analysisResult.indicators.map(i => `${i.label} (${i.severity})`),
        includeInReport: true,
      })
    }
  }

  const handleAddMessage = () => {
    if (!form.text.trim()) return
    add({
      type: 'message',
      originalText: form.text.trim(),
      platform: form.platform || undefined,
      dateTime: form.dateTime || undefined,
      notes: form.notes || undefined,
      context: form.context || undefined,
      includeInReport: true,
    })
    setForm({ text: '', platform: '', dateTime: '', notes: '', context: '' })
    setShowAdd(false)
  }

  const handleScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('File size must be under 10 MB.'); return }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      const checksum = await generateChecksum(dataUrl)
      add({
        type: 'screenshot',
        screenshotFile: { name: file.name, size: file.size, dataUrl, checksum },
        notes: form.notes || undefined,
        includeInReport: true,
      })
      setForm(f => ({ ...f, notes: '' }))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleAddNote = () => {
    if (!form.notes.trim()) return
    add({ type: 'note', notes: form.notes.trim(), includeInReport: true })
    setForm(f => ({ ...f, notes: '' }))
    setShowAdd(false)
  }

  const handleGenerateChecksum = async (item: EvidenceItem) => {
    const content = item.originalText ?? item.notes ?? item.screenshotFile?.dataUrl ?? ''
    const checksum = await generateChecksum(content)
    setChecksumMap(prev => ({ ...prev, [item.id]: checksum }))
  }

  const handleExport = async () => {
    if (!analysisResult) return
    setGenerating(true)
    try {
      await generatePDF(analysisResult, {
        selectedEvidence: items.filter(i => i.includeInReport),
        includeChecklist: true,
        recommendations: analysisResult.recommendations,
      })
    } finally { setGenerating(false) }
  }

  const selected = items.filter(i => i.includeInReport)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <FolderOpen size={26} className="text-violet-500" /> Evidence Workspace
          </h1>
          <p className="text-slate-500 text-sm">
            Evidence is kept in browser memory only. Use the optional save feature to persist between sessions.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Add Evidence
          </button>
          {analysisResult && selected.length > 0 && (
            <button
              onClick={handleExport}
              disabled={generating}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download size={15} /> Export PDF
            </button>
          )}
          {items.length > 0 && (
            <button
              onClick={() => { if (window.confirm('Clear all evidence items? This cannot be undone.')) clearAll() }}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 size={15} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <Info size={16} className="flex-shrink-0 mt-0.5 text-blue-500" />
        <div>
          <strong>Privacy Notice:</strong> Evidence is stored in your browser's local storage only.
          It is never uploaded. Checksums generated here can help detect file changes but do not prove
          origin, date, or authenticity. Always preserve original files independently.
          <span className="ml-1 text-xs text-blue-500">
            (Data can be cleared any time using the "Clear All" button above.)
          </span>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card-lg p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Add Evidence Item</h2>
            <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>

          {/* Type tabs */}
          <div className="flex gap-2 mb-4" role="tablist">
            {(['message', 'screenshot', 'note'] as const).map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={addType === t}
                onClick={() => setAddType(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  addType === t ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'message' ? <FileText size={14} /> : t === 'screenshot' ? <Image size={14} /> : <StickyNote size={14} />}
                {t}
              </button>
            ))}
          </div>

          {addType === 'message' && (
            <div className="space-y-3">
              <textarea
                value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                placeholder="Paste the original message text…"
                rows={4}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <input type="text" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} placeholder="Platform (optional)" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                <input type="datetime-local" value={form.dateTime} onChange={e => setForm(f => ({ ...f, dateTime: e.target.value }))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              </div>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes (optional)" rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
              <button onClick={handleAddMessage} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Add Message</button>
            </div>
          )}

          {addType === 'screenshot' && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-violet-300 transition-colors" onClick={() => fileInputRef.current?.click()}>
                <Image size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500 font-medium">Click to select a screenshot</p>
                <p className="text-xs text-slate-400 mt-1">Max 10 MB · PNG, JPG, WebP</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
              </div>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes about this screenshot (optional)" rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
              <p className="text-xs text-amber-600 flex items-start gap-1.5">
                <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                Screenshots are stored only in your browser's local storage. Keep original copies separately.
              </p>
            </div>
          )}

          {addType === 'note' && (
            <div className="space-y-3">
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Add a note about the incident…" rows={5} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
              <button onClick={handleAddNote} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Add Note</button>
            </div>
          )}
        </div>
      )}

      {/* Evidence items */}
      {items.length === 0 ? (
        <div className="text-center py-24">
          <FolderOpen size={48} className="mx-auto text-slate-200 mb-4" />
          <h2 className="text-lg font-semibold text-slate-600 mb-2">No Evidence Items Yet</h2>
          <p className="text-slate-400 text-sm">Add messages, screenshots, or notes using the button above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">{selected.length} of {items.length} item(s) selected for report export.</p>
          {items.map(item => (
            <div key={item.id} className={`card-md p-5 border-l-4 ${item.includeInReport ? 'border-l-violet-400' : 'border-l-slate-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0 border border-violet-100">
                    {item.type === 'message' ? <FileText size={16} /> : item.type === 'screenshot' ? <Image size={16} /> : <StickyNote size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800 capitalize">{item.type}</span>
                      {item.platform && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{item.platform}</span>}
                      {item.dateTime && <span className="text-xs text-slate-400">{new Date(item.dateTime).toLocaleString('en-LK')}</span>}
                    </div>
                    {item.originalText && (
                      <p className="text-xs text-slate-600 font-mono mt-1 truncate">{item.originalText.slice(0, 150)}{item.originalText.length > 150 ? '…' : ''}</p>
                    )}
                    {item.screenshotFile && (
                      <div className="mt-2">
                        <img src={item.screenshotFile.dataUrl} alt={item.screenshotFile.name} className="max-h-24 rounded-lg border border-slate-200 object-cover" />
                        <p className="text-xs text-slate-400 mt-1">{item.screenshotFile.name} · {(item.screenshotFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    )}
                    {item.notes && <p className="text-xs text-slate-500 mt-1 italic">{item.notes}</p>}
                    {item.analysisFindings && item.analysisFindings.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.analysisFindings.map((f, i) => (
                          <span key={i} className="text-xs bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded">{f}</span>
                        ))}
                      </div>
                    )}
                    {checksumMap[item.id] && (
                      <p className="text-xs text-slate-400 mt-2 font-mono break-all">SHA-256: {checksumMap[item.id]}</p>
                    )}
                    <p className="text-xs text-slate-300 mt-1">Added {new Date(item.addedAt).toLocaleString('en-LK')}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => toggle(item.id)} className={`text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors ${item.includeInReport ? 'bg-violet-50 text-violet-600 border-violet-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`} aria-label={item.includeInReport ? 'Exclude from report' : 'Include in report'}>
                    {item.includeInReport ? <><Eye size={11} /> Include</> : <><EyeOff size={11} /> Excluded</>}
                  </button>
                  {!checksumMap[item.id] && (
                    <button onClick={() => handleGenerateChecksum(item)} className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors">
                      <Hash size={11} /> Checksum
                    </button>
                  )}
                  <button onClick={() => { if (window.confirm('Remove this evidence item?')) remove(item.id) }} className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors">
                    <Trash2 size={11} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
