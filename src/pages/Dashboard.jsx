import { useMemo } from 'react'
import { SECTIONS, TOTAL } from '../data/stickers'

export default function Dashboard({ collection, owned, duplicates, setPage, setFocusSection, heatmapSort, setHeatmapSort }) {
  const needed = TOTAL - owned
  const pct    = TOTAL ? ((owned / TOTAL) * 100).toFixed(1) : 0

  const totalParallels = Object.values(collection).filter(e => e.qty > 0 && e.rarity && e.rarity !== 'base').length

  const allStats = useMemo(() => {
    return SECTIONS.map(s => {
      const ownedCount = s.stickers.filter(st => collection[st.id]?.qty > 0).length
      return { ...s, ownedCount, pct: Math.round((ownedCount / s.stickers.length) * 100) }
    })
  }, [collection])

  const teamStats  = useMemo(() => allStats.filter(s => s.type === 'team'),  [allStats])
  const introStats = useMemo(() => allStats.filter(s => s.type === 'intro'), [allStats])

  const sortedAllStats = useMemo(() => {
    if (heatmapSort === 'alpha') return [...allStats].sort((a, b) => a.name.localeCompare(b.name))
    if (heatmapSort === 'pct')   return [...allStats].sort((a, b) => b.pct - a.pct || a.name.localeCompare(b.name))
    return allStats
  }, [allStats, heatmapSort])

  // Side-panel rankings remain sorted by completion %
  const topTeams    = [...teamStats].sort((a, b) => b.pct - a.pct).slice(0, 5)
  const bottomTeams = [...teamStats].sort((a, b) => a.pct - b.pct).slice(0, 3)
  const mostDuplicated = useMemo(() => {
    return SECTIONS.flatMap(section =>
      section.stickers
        .map(sticker => ({
          ...sticker,
          sectionId: section.id,
          sectionName: section.name,
          flag: section.flag,
          extra: Math.max(0, (collection[sticker.id]?.qty || 0) - 1),
        }))
        .filter(sticker => sticker.extra > 0)
    )
      .sort((a, b) => b.extra - a.extra || a.id.localeCompare(b.id))
      .slice(0, 5)
  }, [collection])
  const openSection = (id) => {
    setFocusSection(id)
    setPage('album')
  }

  const handleNavKeyDown = (e, id) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    openSection(id)
  }

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
          <div className="stat-card-kicker">Owned</div>
          <div className="stat-card-value">{owned}</div>
          <div className="stat-card-label">Stickers owned</div>
        </div>
        <div className="stat-card glass">
          <div className="stat-card-kicker">Need</div>
          <div className="stat-card-value" style={{ color: 'var(--text-2)' }}>{needed}</div>
          <div className="stat-card-label">Still needed</div>
        </div>
        <div className="stat-card glass stat-blue">
          <div className="stat-card-kicker">Dupes</div>
          <div className="stat-card-value">{duplicates}</div>
          <div className="stat-card-label">Duplicate stickers</div>
        </div>
        <div className="stat-card glass stat-green">
          <div className="stat-card-kicker">Rare</div>
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
            <div className="sort-chips" style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              {[['group','Group'],['alpha','A–Z'],['pct','% Done']].map(([key,label]) => (
                <button key={key} className={`chip ${heatmapSort===key?'active':''}`} onClick={() => setHeatmapSort(key)}>{label}</button>
              ))}
            </div>
            {(() => {
              const renderTile = (ts) => (
                <div
                  key={ts.id}
                  className={`team-tile glass ${ts.pct === 100 ? 'complete' : ''}`}
                  onClick={() => openSection(ts.id)}
                  onKeyDown={e => handleNavKeyDown(e, ts.id)}
                  role="button"
                  tabIndex={0}
                  title={`${ts.name}: ${ts.ownedCount}/${ts.stickers.length}`}
                >
                  <div className="team-tile-flag">{ts.flag || '🏆'}</div>
                  <div className="team-tile-name">{ts.name}</div>
                  <div className="team-tile-pct">{ts.pct}%</div>
                  <div className="team-tile-bar">
                    <div className="team-tile-fill" style={{ width: `${ts.pct}%` }} />
                  </div>
                </div>
              )

              if (heatmapSort !== 'group') {
                return <div className="team-comp-grid">{sortedAllStats.map(renderTile)}</div>
              }

              return (
                <>
                  {introStats.length > 0 && (
                    <div className="group-block">
                      <div className="group-label">Special</div>
                      <div className="team-comp-grid">{introStats.map(renderTile)}</div>
                    </div>
                  )}
                  {['A','B','C','D','E','F','G','H','I','J','K','L'].map(letter => {
                    const groupTeams = teamStats.filter(ts => ts.group === letter)
                    if (!groupTeams.length) return null
                    return (
                      <div key={letter} className="group-block">
                        <div className="group-label">Group {letter}</div>
                        <div className="team-comp-grid">{groupTeams.map(renderTile)}</div>
                      </div>
                    )
                  })}
                </>
              )
            })()}
          </div>
        </div>

        {/* Side panel */}
        <div className="side-panel">
          {/* Top teams */}
          <div className="card glass">
            <div className="section-title">Most Complete</div>
            {topTeams.map((ts, i) => (
              <div
                key={ts.id}
                className="top-team-row"
                onClick={() => openSection(ts.id)}
                onKeyDown={e => handleNavKeyDown(e, ts.id)}
                role="button"
                tabIndex={0}
              >
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
              {bottomTeams.filter(t => t.pct < 100).map((ts) => (
                <div
                  key={ts.id}
                  className="top-team-row"
                  onClick={() => setPage('missing')}
                  onKeyDown={e => {
                    if (e.key !== 'Enter' && e.key !== ' ') return
                    e.preventDefault()
                    setPage('missing')
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <span className="top-team-rank">{ts.stickers.length - ts.ownedCount}</span>
                  <span className="top-team-flag">{ts.flag}</span>
                  <span className="top-team-name">{ts.name}</span>
                  <span className="top-team-pct" style={{ color: 'var(--text-3)' }}>{ts.pct}%</span>
                </div>
              ))}
            </div>
          )}

          <div className="card glass">
            <div className="section-title">Most Duplicated</div>
            {mostDuplicated.length > 0 ? (
              <div className="dupe-rank-list">
                {mostDuplicated.map((sticker, index) => (
                  <div key={sticker.id} className="dupe-rank-row">
                    <span className="top-team-rank">#{index + 1}</span>
                    <span className="dupe-rank-main">
                      <span className="dupe-rank-id">{sticker.id}</span>
                      <span className="dupe-rank-name">{sticker.name}</span>
                    </span>
                    <span className="dupe-rank-extra">+{sticker.extra}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="panel-empty">No duplicate stickers yet.</div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
