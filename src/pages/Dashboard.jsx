import { useMemo } from 'react'
import { SECTIONS, TOTAL, ALL_STICKERS } from '../data/stickers'

export default function Dashboard({ collection, owned, duplicates, setPage, setFocusSection }) {
  const needed = TOTAL - owned
  const pct    = TOTAL ? ((owned / TOTAL) * 100).toFixed(1) : 0

  const rarityStats = useMemo(() => {
    let blue = 0, green = 0, foilOwned = 0
    Object.entries(collection).forEach(([id, e]) => {
      if (e.qty < 1) return
      if (e.rarity === 'blue')  blue++
      if (e.rarity === 'green') green++
      const sticker = ALL_STICKERS.find(s => s.id === id)
      if (sticker?.type === 'foil') foilOwned++
    })
    return { blue, green, foilOwned }
  }, [collection])

  const teamStats = useMemo(() => {
    return SECTIONS
      .filter(s => s.type === 'team')
      .map(s => {
        const ownedCount = s.stickers.filter(st => collection[st.id]?.qty > 0).length
        return { ...s, ownedCount, pct: Math.round((ownedCount / s.stickers.length) * 100) }
      })
      .sort((a, b) => b.pct - a.pct)
  }, [collection])

  const topTeams    = teamStats.slice(0, 5)
  const bottomTeams = [...teamStats].sort((a, b) => a.pct - b.pct).slice(0, 3)

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
          <div className="stat-card-value">{rarityStats.blue + rarityStats.green}</div>
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
              <div className="rarity-dot base" />
              <span className="rarity-label">Base stickers</span>
              <span className="rarity-count">{owned - rarityStats.blue - rarityStats.green}</span>
            </div>
            <div className="rarity-item">
              <div className="rarity-dot foil" />
              <span className="rarity-label">Foil stickers ✦</span>
              <span className="rarity-count" style={{ color: 'var(--gold)' }}>{rarityStats.foilOwned}</span>
            </div>
            <div className="rarity-item">
              <div className="rarity-dot blue" />
              <span className="rarity-label">Blue frame 🔵</span>
              <span className="rarity-count" style={{ color: 'var(--blue)' }}>{rarityStats.blue}</span>
            </div>
            <div className="rarity-item">
              <div className="rarity-dot green" />
              <span className="rarity-label">Green frame 🟢</span>
              <span className="rarity-count" style={{ color: 'var(--green)' }}>{rarityStats.green}</span>
            </div>
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
        </div>
      </div>
    </div>
  )
}
