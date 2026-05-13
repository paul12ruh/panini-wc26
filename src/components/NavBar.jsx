import { TOTAL } from '../data/stickers'

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'album',     label: 'Album',     icon: '⊞' },
  { id: 'missing',   label: 'Missing',   icon: '◌' },
  { id: 'dupes',     label: 'Duplicates', icon: '⊕' },
  { id: 'stats',     label: 'Stats',      icon: '◈' },
]

export default function NavBar({ page, setPage, owned, signOut, syncStatus, syncError }) {
  const pct = Math.round((owned / TOTAL) * 100)
  const syncLabel = syncError || (
    syncStatus === 'saving' ? 'Saving collection' :
    syncStatus === 'loading' ? 'Loading collection' :
    syncStatus === 'synced' ? 'Collection synced' :
    'Collection sync idle'
  )

  return (
    <nav className="navbar">
      <button className="navbar-brand" onClick={() => setPage('dashboard')} aria-label="Dashboard">
        <div className="navbar-logo">⚽</div>
        <span className="navbar-brand-text">Panini <span>WC26</span></span>
      </button>

      <div className="navbar-links">
        {PAGES.map(p => (
          <button
            key={p.id}
            className={`nav-btn ${page === p.id ? 'active' : ''}`}
            onClick={() => setPage(p.id)}
          >
            <span style={{ fontFamily: 'monospace' }}>{p.icon}</span>
            <span className="nav-btn-label">{p.label}</span>
          </button>
        ))}
      </div>

      <div className="nav-progress">
        <strong>{pct}%</strong>
        <span>{owned}/{TOTAL}</span>
      </div>
      <div className={`nav-sync nav-sync-${syncStatus}`} title={syncLabel} aria-label={syncLabel}>
        {syncStatus === 'error' ? '!' : syncStatus === 'saving' || syncStatus === 'loading' ? '...' : '✓'}
      </div>
      <button className="nav-signout" onClick={signOut} title="Sign out" aria-label="Sign out">↪</button>
    </nav>
  )
}
