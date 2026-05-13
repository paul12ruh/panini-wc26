import { useMemo } from 'react'
import { SECTIONS, TOTAL, ALL_STICKERS, CONFEDERATIONS } from '../data/stickers'

export default function Dashboard({ collection, owned, duplicates, setPage, setFocusSection }) {
  const needed = TOTAL - owned
  const pct    = TOTAL ? ((owned / TOTAL) * 100).toFixed(1) : 0

  const RARITY_COLORS = {
    blue:   '#4da6ff',
    red:    '#ff5c5c',
    purple: '#b06efc',
    green:  '#39ff89',
    black:  '#e0e0e0',
  }

  const rarityStats = useMemo(() => {
    const counts = { blue: 0, red: 0, purple: 0, green: 0, black: 0, foilOwned: 0 }
    Object.entries(collection).forEach(([id, e]) => {
      if (e.qty < 1) return
      if (e.rarity && e.rarity !== 'base' && counts[e.rarity] !== undefined) counts[e.rarity]++
      const sticker = ALL_STICKERS.find(s => s.id === id)
      if (sticker?.type === 'foil') counts.foilOwned++
    })
    return counts
  }, [collection])

  const totalParallels = Object.entries(rarityStats)
    .filter(([k]) => k !== 'foilOwned')
    .reduce((sum, [, v]) => sum + v, 0)

  // Album order — no sort, matches physical SECTIONS order
  const teamStats = useMemo(() => {
    return SECTIONS
      .filter(s => s.type === 'team')
      .map(s => {
        const ownedCount = s.stickers.filter(st => collection[st.id]?.qty > 0).length
        return { ...s, ownedCount, pct: Math.round((ownedCount / s.stickers.length) * 100) }
      })
  }, [collection])

  // Side-panel rankings remain sorted by completion %
  const topTeams    = [...teamStats].sort((a, b) => b.pct - a.pct).slice(0, 5)
  const bottomTeams = [...teamStats].sort((a, b) => a.pct - b.pct).slice(0, 3)

  const confStats = useMemo(() => {
    return CONFEDERATIONS.map(conf => {
      const sections = SECTIONS.filter(s => s.type === 'team' && s.confederation === conf)
      const total    = sections.reduce((sum, s) => sum + s.stickers.length, 0)
      const owned    = sections.reduce(
        (sum, s) => sum + s.stickers.filter(st => collection[st.id]?.qty > 0).length,
        0
      )
      const pct = total ? Math.round((owned / total) * 100) : 0
      return { conf, owned, total, pct }
    })
  }, [collection])

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-label">FIFA World Cup 2026 · Panini Sticker Album</div>
          <div className="hero-title">
            <span>{pct}%</span> Complete
          </div>
          <div className="hero-subtitle">
            {owned} of {TOTAL} stickers collected · {needed} still needed
          </div>
          <div className="hero-bar-label">
            <span>Progress</span>
            <strong>{owned} / {TOTAL}</strong>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card glass stat-primary">
          <div className="stat-card-icon">🎯</div>
          <div className="stat-card-value">{owned}</div>
          <div className="stat-card-label">Stickers owned</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-card-icon">🔍</div>
          <div className="stat-card-value" style={{ color: 'var(--text-2)' }}>{needed}</div>
          <div className="stat-card-label">Still needed</div>
        </div>
        <div className="stat-card glass stat-blue">
          <div className="stat-card-icon">📦</div>
          <div className="stat-card-value">{duplicates}</div>
          <div className="stat-card-label">Duplicate stickers</div>
        </div>
        <div className="stat-card glass stat-green">
          <div className="stat-card-icon">🌟</div>
          <div className="stat-card-value">{totalParallels}</div>
          <div className="stat-card-label">Rare parallels</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Team completion heatmap */}
        <div>
          <div className="section-title">Team Completion</div>
          <div className="card glass">
            <div className="team-comp-grid">
              {teamStats.map(ts => (
                <div
                  key={ts.id}
                  className={`team-tile glass ${ts.pct === 100 ? 'complete' : ''}`}
                  onClick={() => { setFocusSection(ts.id); setPage('album') }}
                  title={`${ts.name}: ${ts.ownedCount}/${ts.stickers.length}`}
                >
                  <div className="team-tile-flag">{ts.flag}</div>
                  <div className="team-tile-name">{ts.name}</div>
                  <div className="team-tile-pct">{ts.pct}%</div>
                  <div className="team-tile-bar">
                    <div className="team-tile-fill" style={{ width: `${ts.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="side-panel">
          {/* Rarity breakdown */}
          <div className="card glass">
            <div className="section-title">Rarity Breakdown</div>
            <div className="rarity-item">
              <div className="rarity-dot foil" />
              <span className="rarity-label">Foil ✦</span>
              <span className="rarity-count" style={{ color: 'var(--gold)' }}>{rarityStats.foilOwned}</span>
            </div>
            {Object.entries(RARITY_COLORS).map(([key, color]) =>
              rarityStats[key] > 0 ? (
                <div key={key} className="rarity-item">
                  <div className="rarity-dot" style={{ background: color }} />
                  <span className="rarity-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span className="rarity-count" style={{ color }}>{rarityStats[key]}</span>
                </div>
              ) : null
            )}
          </div>

          {/* Top teams */}
          <div className="card glass">
            <div className="section-title">Most Complete</div>
            {topTeams.map((ts, i) => (
              <div key={ts.id} className="top-team-row" onClick={() => { setFocusSection(ts.id); setPage('album') }}>
                <span className="top-team-rank">#{i + 1}</span>
                <span className="top-team-flag">{ts.flag}</span>
                <span className="top-team-name">{ts.name}</span>
                <span className="top-team-pct">{ts.pct}%</span>
              </div>
            ))}
          </div>

          {/* Needs attention */}
          {bottomTeams.some(t => t.pct < 100) && (
            <div className="card glass">
              <div className="section-title">Needs Attention</div>
              {bottomTeams.filter(t => t.pct < 100).map((ts, i) => (
                <div key={ts.id} className="top-team-row" onClick={() => setPage('missing')}>
                  <span className="top-team-rank">{ts.stickers.length - ts.ownedCount}</span>
                  <span className="top-team-flag">{ts.flag}</span>
                  <span className="top-team-name">{ts.name}</span>
                  <span className="top-team-pct" style={{ color: 'var(--text-3)' }}>{ts.pct}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Confederation breakdown */}
          <div className="card glass">
            <div className="section-title">By Confederation</div>
            {confStats.map(({ conf, owned, total, pct }) => (
              <div key={conf} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{conf}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{owned}/{total}</span>
                </div>
                <div className="ts-bar" style={{ width: '100%' }}>
                  <div
                    className={`ts-bar-fill${pct === 100 ? ' done' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
