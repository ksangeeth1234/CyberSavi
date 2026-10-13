import { useState } from 'react'
import type { PipelineStage } from '../../types'
import {
  MessageSquare, ShieldCheck, Globe, AlertTriangle,
  Repeat, BarChart2, Lightbulb, FileText, ChevronDown, ChevronUp, CheckCircle2, Loader2
} from 'lucide-react'

const STAGE_ICONS = [MessageSquare, ShieldCheck, Globe, AlertTriangle, Repeat, BarChart2, Lightbulb, FileText]

const STATUS_COLOR: Record<PipelineStage['status'], string> = {
  pending: 'bg-slate-100 text-slate-400 border-slate-200',
  active: 'bg-blue-50 text-blue-600 border-blue-200',
  complete: 'bg-green-50 text-green-600 border-green-200',
  error: 'bg-red-50 text-red-600 border-red-200',
}

const CONNECTOR_COLOR: Record<PipelineStage['status'], string> = {
  pending: 'bg-slate-200',
  active: 'bg-blue-300',
  complete: 'bg-green-400',
  error: 'bg-red-300',
}

interface Props { stages: PipelineStage[]; compact?: boolean }

export default function PipelineViz({ stages, compact }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (compact) {
    // Mobile: linear progress bar
    const done = stages.filter(s => s.status === 'complete').length
    const active = stages.find(s => s.status === 'active')
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{active ? active.name : done === stages.length ? 'Complete' : 'Pending…'}</span>
          <span>{done}/{stages.length}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${(done / stages.length) * 100}%` }}
          />
        </div>
        {active && (
          <p className="text-xs text-blue-600 animate-pulse">{active.description}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2" role="list" aria-label="Analysis pipeline stages">
      {stages.map((stage, i) => {
        const Icon = STAGE_ICONS[i] ?? BarChart2
        const isExpanded = expanded === stage.id
        const isActive = stage.status === 'active'
        const isDone = stage.status === 'complete'

        return (
          <div key={stage.id} role="listitem" className="relative">
            {/* Connector */}
            {i < stages.length - 1 && (
              <div className={`absolute left-[19px] top-10 w-0.5 h-4 ${CONNECTOR_COLOR[stage.status]} transition-colors duration-300 z-0`} />
            )}

            <div
              className={`relative z-10 border rounded-xl p-3.5 transition-all duration-300 cursor-pointer select-none
                ${STATUS_COLOR[stage.status]}
                ${isActive ? 'shadow-md shadow-blue-100' : ''}
              `}
              onClick={() => setExpanded(isExpanded ? null : stage.id)}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-label={`${stage.name}: ${stage.status}`}
              onKeyDown={e => e.key === 'Enter' && setExpanded(isExpanded ? null : stage.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Status icon */}
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${STATUS_COLOR[stage.status]}`}>
                    {isActive ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : isDone ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Icon size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{stage.name}</p>
                    {stage.detail && (
                      <p className="text-xs mt-0.5 opacity-80">{stage.detail}</p>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isExpanded ? <ChevronUp size={14} className="opacity-50" /> : <ChevronDown size={14} className="opacity-50" />}
                </div>
              </div>

              {/* Expanded description */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-10 text-xs opacity-80 leading-relaxed">
                  {stage.description}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
