import { useState } from 'react'
import { TOTAL } from '../data/stickers'

const PRIMARY_PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'album',     label: 'Album',     icon: '⊞' },
  { id: 'missing',   label: 'Missing',   icon: '◌' },
  { id: 'dupes',     label: 'Duplicates', icon: '⊕' },
]

const SECONDARY_PAGES = [
  { id: 'stats',     label: 'Stats',      icon: '◈' },
  { id: 'tools',     label: 'Tools',      icon: '▣' },
]

export default function NavBar({ page, setPage, owned, signOut, syncStatus, syncError, lastSyncedAt, syncDisabled }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const pct = Math.round((owned / TOTAL) * 100)
  const syncedTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null
  const syncLabel = syncError || (
    syncDisabled ? 'Local dev mode' :
    syncStatus === 'saving' ? 'Saving collection' :
    syncStatus === 'loading' ? 'Loading collection' :
    syncStatus === 'synced' ? `Synced${syncedTime ? ` ${syncedTime}` : ''}` :
    'Collection sync idle'
  )
  const handleSetPage = (nextPage) => {
    setMoreOpen(false)
    setPage(nextPage)
  }

  const handleSignOut = () => {
    setMoreOpen(false)
    signOut()
  }

  return (
    <nav className="navbar">
      <button className="navbar-brand" onClick={() => handleSetPage('dashboard')} aria-label="Dashboard">
        <div className="navbar-logo">⚽</div>
        <span className="navbar-brand-text">Panini <span>WC26</span></span>
      </button>

      <div className="navbar-links">
        {PRIMARY_PAGES.map(p => (
          <button
            key={p.id}
            className={`nav-btn ${page === p.id ? 'active' : ''}`}
            onClick={() => handleSetPage(p.id)}
          >
            <span style={{ fontFamily: 'monospace' }}>{p.icon}</span>
            <span className="nav-btn-label">{p.label}</span>
          </button>
        ))}
        {SECONDARY_PAGES.map(p => (
          <button
            key={p.id}
            className={`nav-btn nav-secondary ${page === p.id ? 'active' : ''}`}
            onClick={() => handleSetPage(p.id)}
          >
            <span style={{ fontFamily: 'monospace' }}>{p.icon}</span>
            <span className="nav-btn-label">{p.label}</span>
          </button>
        ))}
        <div className="nav-more-wrapper">
          <button
            className={`nav-btn nav-more-btn ${SECONDARY_PAGES.some(p => p.id === page) ? 'active' : ''}`}
            onClick={() => setMoreOpen(open => !open)}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
          >
            <span style={{ fontFamily: 'monospace' }}>⋯</span>
            <span className="nav-btn-label">More</span>
          </button>
          {moreOpen && (
            <div className="nav-more-menu" role="menu">
              {SECONDARY_PAGES.map(p => (
                <button key={p.id} role="menuitem" onClick={() => handleSetPage(p.id)}>
                  <span style={{ fontFamily: 'monospace' }}>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
              <button role="menuitem" onClick={handleSignOut}>
                <span style={{ fontFamily: 'monospace' }}>⇥</span>
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="nav-progress">
        <strong>{pct}%</strong>
        <span>{owned}/{TOTAL}</span>
      </div>
      <div
        className={`nav-sync nav-sync-${syncDisabled ? 'local' : syncStatus}`}
        title={syncLabel}
        role="status"
        aria-live="polite"
      >
        <span aria-hidden="true">
          {syncStatus === 'error' ? '!' : syncStatus === 'saving' || syncStatus === 'loading' ? '...' : '✓'}
        </span>
        <span className="nav-sync-text">{syncLabel}</span>
      </div>
      <button className="nav-signout" onClick={handleSignOut} title="Sign out" aria-label="Sign out">Sign out</button>
    </nav>
  )
}
