import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface Props { compact?: boolean }

export default function PWAInstallPrompt({ compact }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt || dismissed) return null

  const install = async () => {
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted' || outcome === 'dismissed') {
      setDeferredPrompt(null)
      setDismissed(true)
    }
  }

  if (compact) {
    return (
      <button
        onClick={install}
        className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-100 transition-colors"
        aria-label="Install SafeSpace LK as an app"
      >
        <Download size={11} /> Install App
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 card-md p-4 max-w-sm shadow-xl animate-fade-in-up">
      <p className="text-sm font-semibold text-slate-800 mb-1">Install SafeSpace LK</p>
      <p className="text-xs text-slate-500 mb-3">Add to your home screen for offline access.</p>
      <div className="flex gap-2">
        <button
          onClick={install}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  )
}
