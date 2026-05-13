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
      if (e.rarity && e.rarity !== 'base' && counts[e.rarity] !== undefined) counts[e.rarity]++
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
      return { conf, owned, total, pct }
    })
  }, [collection])

  const hasAnyParallels = Object.entries(rarityStats)
    .filter(([k]) => k !== 'foilOwned')
    .some(([, v]) => v > 0)

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Stats</div>
      </div>

      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>
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

        {/* By Confederation */}
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
  )
}
