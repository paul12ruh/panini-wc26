import { useMemo } from 'react'
import { ALL_STICKERS, SECTIONS, CONFEDERATIONS } from '../data/stickers'

const RARITY_COLORS = {
  blue:   '#4da6ff',
  red:    '#ff5c5c',
  purple: '#b06efc',
  green:  '#39ff89',
  black:  '#e0e0e0',
}

export default function Stats({ collection }) {
  const rarityStats = useMemo(() => {
    const counts = { blue: 0, red: 0, purple: 0, green: 0, black: 0, foilOwned: 0 }
    Object.entries(collection).forEach(([id, e]) => {
      if (e.qty < 1) return
      if (e.variants) {
        Object.keys(RARITY_COLORS).forEach(rarity => {
          counts[rarity] += e.variants[rarity] || 0
        })
      } else if (e.rarity && e.rarity !== 'base' && counts[e.rarity] !== undefined) {
        counts[e.rarity]++
      }
      const sticker = ALL_STICKERS.find(s => s.id === id)
      if (sticker?.type === 'foil') counts.foilOwned++
    })
    return counts
  }, [collection])

  const confStats = useMemo(() => {
    return CONFEDERATIONS.map(conf => {
      const sections = SECTIONS.filter(s => s.type === 'team' && s.confederation === conf)
      const total    = sections.reduce((sum, s) => sum + s.stickers.length, 0)
      const owned    = sections.reduce(
        (sum, s) => sum + s.stickers.filter(st => collection[st.id]?.qty > 0).length,
        0
      )
      const pct = total ? Math.round((owned / total) * 100) : 0
      const teams = sections.map(section => {
        const teamOwned = section.stickers.filter(st => collection[st.id]?.qty > 0).length
        const teamTotal = section.stickers.length
        const teamPct = teamTotal ? Math.round((teamOwned / teamTotal) * 100) : 0
        return {
          id: section.id,
          name: section.name,
          flag: section.flag,
          group: section.group,
          owned: teamOwned,
          total: teamTotal,
          pct: teamPct,
        }
      })
      return { conf, owned, total, pct, teams }
    })
  }, [collection])

  const confSummary = useMemo(() => {
    const owned = confStats.reduce((sum, item) => sum + item.owned, 0)
    const total = confStats.reduce((sum, item) => sum + item.total, 0)
    const best = confStats.reduce((leader, item) => (item.pct > leader.pct ? item : leader), confStats[0])
    const needsWork = confStats.reduce((lowest, item) => (item.pct < lowest.pct ? item : lowest), confStats[0])
    return { owned, total, best, needsWork }
  }, [confStats])

  const hasAnyParallels = Object.entries(rarityStats)
    .filter(([k]) => k !== 'foilOwned')
    .some(([, v]) => v > 0)

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Stats</div>
      </div>

      <div className="stats-layout">
        {/* Rarity Breakdown */}
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
          {!hasAnyParallels && rarityStats.foilOwned === 0 && (
            <div style={{ fontSize: 13, color: 'var(--text-3)', paddingTop: 8 }}>
              No parallel stickers tagged yet.
            </div>
          )}
        </div>

        <div className="conf-view">
          <div className="conf-view-header">
            <div>
              <div className="section-title">Confederation View</div>
              <div className="conf-view-subtitle">
                {confSummary.owned}/{confSummary.total} team stickers owned across all confederations.
              </div>
            </div>
            <div className="conf-summary">
              <div>
                <span>Strongest</span>
                <strong>{confSummary.best.conf} · {confSummary.best.pct}%</strong>
              </div>
              <div>
                <span>Needs focus</span>
                <strong>{confSummary.needsWork.conf} · {confSummary.needsWork.pct}%</strong>
              </div>
            </div>
          </div>

          <div className="conf-grid">
            {confStats.map(({ conf, owned, total, pct, teams }) => (
              <div key={conf} className="conf-card glass">
                <div className="conf-card-top">
                  <div>
                    <div className="conf-name">{conf}</div>
                    <div className="conf-meta">{teams.length} teams · {owned}/{total} owned</div>
                  </div>
                  <div className={`conf-pct ${pct === 100 ? 'done' : ''}`}>{pct}%</div>
                </div>
                <div className="ts-bar conf-bar">
                  <div
                    className={`ts-bar-fill${pct === 100 ? ' done' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="conf-team-list">
                  {teams.map(team => (
                    <div key={team.id} className="conf-team-row">
                      <span className="conf-team-flag">{team.flag}</span>
                      <span className="conf-team-name">{team.name}</span>
                      <span className="conf-team-group">Group {team.group}</span>
                      <span className="conf-team-count">{team.owned}/{team.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
