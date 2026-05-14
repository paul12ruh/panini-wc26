import { useState } from 'react'
import Dashboard from './Dashboard'
import Missing from './Missing'
import Duplicates from './Duplicates'
import Stats from './Stats'
import { usePublicShare } from '../hooks/usePublicShare'
import { calculateCollectionStats } from '../lib/collectionStats'

const SHARE_TABS = [
  { id: 'dashboard', label: 'Progress' },
  { id: 'missing', label: 'Missing' },
  { id: 'dupes', label: 'Duplicates' },
  { id: 'stats', label: 'Stats' },
]

export default function SharePage({ slug }) {
  const [tab, setTab] = useState('dashboard')
  const [heatmapSort, setHeatmapSort] = useState('group')
  const { collection, updatedAt, status, error, refresh } = usePublicShare(slug)
  const { owned, duplicates } = calculateCollectionStats(collection)
  const loading = status === 'loading'
  const refreshing = status === 'refreshing'

  if (loading) {
    return (
      <div className="share-shell">
        <div className="auth-loading">Loading shared collection...</div>
      </div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="share-shell">
        <div className="empty">
          <div className="empty-title">Share link not found</div>
          <div className="empty-sub">This link may have been disabled or regenerated.</div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="share-shell">
        <div className="empty">
          <div className="empty-title">Unable to load share</div>
          <div className="empty-sub">{error || 'Try refreshing this page.'}</div>
          <button className="btn btn-primary" onClick={refresh}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="share-shell">
      <header className="share-header">
        <div>
          <div className="share-kicker">Read-only shared collection</div>
          <h1>Panini WC26 Tracker</h1>
          <p>
            {updatedAt
              ? `Last synced ${new Date(updatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`
              : 'Live progress view'}
            {refreshing ? ' · refreshing...' : ''}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={refresh} disabled={refreshing}>Refresh</button>
      </header>

      <nav className="share-tabs" aria-label="Shared collection views">
        {SHARE_TABS.map(item => (
          <button
            key={item.id}
            className={`chip ${tab === item.id ? 'active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === 'dashboard' && (
        <Dashboard
          collection={collection}
          owned={owned}
          duplicates={duplicates}
          heatmapSort={heatmapSort}
          setHeatmapSort={setHeatmapSort}
          readOnly
        />
      )}
      {tab === 'missing' && <Missing collection={collection} readOnly />}
      {tab === 'dupes' && <Duplicates collection={collection} readOnly />}
      {tab === 'stats' && <Stats collection={collection} />}
    </div>
  )
}
