import { Lock, Shield, Database, Eye, Trash2, Info } from 'lucide-react'
import { clearAllLocalData } from '../services/privacyManager'

const SECTIONS = [
  {
    icon: Lock,
    title: 'Local-First Processing',
    content: `All message text submitted for analysis is processed entirely within your browser using JavaScript.
    No text, analysis results, or evidence is transmitted to any remote server by default.
    The application does not include analytics that capture or log message content.`,
  },
  {
    icon: Database,
    title: 'Data Storage',
    content: `SafeSpace LK does not use a database. Evidence items you choose to save are stored in your
    browser's localStorage (on your device only). Analysis results are stored in sessionStorage and are
    automatically cleared when you close the browser tab. You can delete all locally stored data at any
    time using the "Clear All Local Data" button on this page.`,
  },
  {
    icon: Eye,
    title: 'What We Do Not Collect',
    content: `We do not collect your name, contact details, location, or device identifiers.
    We do not request GPS access, camera access, microphone access, or access to your contacts.
    We do not use third-party analytics services that would transmit message content.
    We do not track which messages you analyse.`,
  },
  {
    icon: Shield,
    title: 'External Services',
    content: `The map uses OpenStreetMap tile data served by OpenStreetMap's free CDN.
    Map tiles are image files that do not contain your message content.
    Google Fonts are loaded for typography — this is a standard web request that carries no message data.
    No other external services are used by default.`,
  },
  {
    icon: Info,
    title: 'Evidence and Reports',
    content: `Evidence you add is stored locally in your browser. Screenshots are stored as data URLs in
    localStorage. Reports (PDF/PNG) are generated client-side and downloaded directly to your device —
    they are never uploaded. Integrity checksums are computed locally using the browser's Web Crypto API.`,
  },
  {
    icon: Shield,
    title: 'Limitations and Confidentiality',
    content: `We cannot guarantee absolute confidentiality of data stored in your browser — other applications
    or extensions on your device may have access to localStorage. For highly sensitive evidence, consider
    using your device's encrypted storage or consult a legal professional. Do not include passwords,
    authentication tokens, or unnecessary personal identifiers in submitted messages or notes.`,
  },
]

export default function PrivacyPage() {
  const handleClearData = () => {
    if (window.confirm('This will delete all locally stored evidence and analysis results. This action cannot be undone. Continue?')) {
      clearAllLocalData()
      alert('All local data has been cleared.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-blue-100">
          <Lock size={12} /> Privacy-First Application
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Privacy Notice</h1>
        <p className="text-slate-500 leading-relaxed">
          SafeSpace LK is built around a privacy-first principle. This notice explains exactly how
          data is — and is not — handled. Please read it before submitting any sensitive content.
        </p>
      </div>

      <div className="space-y-4 mb-10">
        {SECTIONS.map(({ icon: Icon, title, content }) => (
          <section key={title} className="card-md p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800 mb-2">{title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{content}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Clear data */}
      <section className="card-md p-6 border-red-100 bg-red-50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-red-800 mb-2">Clear All Local Data</h2>
            <p className="text-sm text-red-700 mb-4 leading-relaxed">
              This will permanently delete all evidence items, saved preferences, and locally stored
              analysis data from your browser. This action cannot be undone.
            </p>
            <button
              onClick={handleClearData}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 size={14} /> Clear All Local Data
            </button>
          </div>
        </div>
      </section>

      {/* Research context */}
      <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong>Research Context:</strong> SafeSpace LK was developed as part of academic research on
          "A Privacy-Aware NLP Framework for Cyberbullying Detection and Digital Evidence Support in
          Sinhala-English Social Media Text." It is not a commercial product. It does not constitute
          legal advice, a police report, or a clinical assessment. For serious safety concerns, always
          contact appropriate professionals or authorities.
        </p>
      </div>
    </div>
  )
}
