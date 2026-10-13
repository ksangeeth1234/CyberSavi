import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  Shield, Menu, X, Home, Search, BarChart3,
  FolderOpen, FlaskConical, Lock, Wifi, WifiOff
} from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import PWAInstallPrompt from '../ui/PWAInstallPrompt'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/analyze', label: 'Analyze', icon: Search },
  { to: '/results', label: 'Results', icon: BarChart3 },
  { to: '/evidence', label: 'Evidence', icon: FolderOpen },
  { to: '/research', label: 'Research', icon: FlaskConical },
  { to: '/privacy', label: 'Privacy', icon: Lock },
]

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isOnline = useOnlineStatus()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ── Offline Banner ── */}
      {!isOnline && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-amber-800 text-sm font-medium"
        >
          <WifiOff size={14} />
          You are offline. The analysis engine works locally. Map tiles may be unavailable.
        </div>
      )}

      {/* ── Topnav ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <nav
          aria-label="Main navigation"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        >
          {/* Brand */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 text-blue-600 font-bold text-lg hover:text-blue-700 transition-colors"
            aria-label="SafeSpace LK — Home"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Shield size={18} className="text-white" />
            </div>
            <span className="hidden sm:inline">SafeSpace LK</span>
          </NavLink>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                <Wifi size={11} /> Online
              </span>
            ) : (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                <WifiOff size={11} /> Offline
              </span>
            )}
            <PWAInstallPrompt compact />
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile nav */}
        {mobileOpen && (
          <div
            id="mobile-nav"
            className="md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-1"
          >
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Shield size={13} className="text-blue-500" />
              <span>
                SafeSpace LK — Privacy-Aware NLP Research Tool. Processing is local-only by default.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <NavLink to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Notice</NavLink>
              <span>·</span>
              <span>Not legal or medical advice.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
