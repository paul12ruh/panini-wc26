import { TOTAL } from '../data/stickers'

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'album',     label: 'Album',     icon: '⊞' },
  { id: 'missing',   label: 'Missing',   icon: '◌' },
  { id: 'dupes',     label: 'Duplicates', icon: '⊕' },
]

export default function NavBar({ page, setPage, owned }) {
  const pct = Math.round((owned / TOTAL) * 100)

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => setPage('dashboard')}>
        <div className="navbar-logo">⚽</div>
        Panini <span>WC26</span>
      </div>

      <div className="navbar-links">
        {PAGES.map(p => (
          <button
            key={p.id}
            className={`nav-btn ${page === p.id ? 'active' : ''}`}
            onClick={() => setPage(p.id)}
          >
            <span style={{ fontFamily: 'monospace' }}>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      <div className="nav-progress">
        <strong>{pct}%</strong>
        <span>{owned}/{TOTAL}</span>
      </div>
    </nav>
  )
}
