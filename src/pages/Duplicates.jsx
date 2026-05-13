import { useMemo, useState } from 'react'
import { SECTIONS } from '../data/stickers'

const RARITY_COLORS = {
  blue:   '#4da6ff',
  red:    '#ff5c5c',
  purple: '#b06efc',
  green:  '#39ff89',
  black:  '#e0e0e0',
}

export default function Duplicates({ collection }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')

  const groups = useMemo(() => {
    const dupIds = Object.entries(collection)
      .filter(([, e]) => e.qty > 1)
      .map(([id]) => id)

    return SECTIONS
      .map(s => ({
        ...s,
        dups: s.stickers
          .filter(st => dupIds.includes(st.id))
          .map(st => ({ ...st, qty: collection[st.id].qty, rarity: collection[st.id].rarity })),
      }))
      .filter(s => s.dups.length > 0)
  }, [collection])

  const totalDups = groups.reduce((n, g) =>
    n + g.dups.reduce((m, s) => m + (s.qty - 1), 0), 0)

  const copyTrade = () => {
    const lines = groups.map(g => {
      const ids = g.dups.flatMap(s => {
        const extra = s.qty - 1
        return extra > 1 ? [`${s.id}×${extra}`] : [s.id]
      })
      return `${g.name}: ${ids.join(', ')}`
    })
    const text = `Trade list (${totalDups} duplicates)\n\n${lines.join('\n')}`
    setCopyError('')
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => setCopyError('Copy failed. Your browser may require HTTPS or clipboard permission.'))
  }

  if (groups.length === 0) return (
    <div className="page">
      <div className="empty">
        <div className="empty-icon">📦</div>
        <div className="empty-title">No duplicates yet</div>
        <div className="empty-sub">When you have more than one of a sticker, they&apos;ll appear here.</div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Duplicates</div>
        <div className="page-subtitle">{totalDups} extra stickers ready to trade</div>
      </div>

      <div className="list-toolbar">
        <button className="btn btn-primary" onClick={copyTrade}>
          {copied ? '✓ Copied!' : '📋 Copy trade list'}
        </button>
      </div>
      {copyError && <div className="inline-error">{copyError}</div>}

      {groups.map(g => (
        <div key={g.id} className="group-card glass">
          <div className="group-header">
            <span className="group-flag">{g.flag || '🏆'}</span>
            <span className="group-name">{g.name}</span>
            <span className="group-count">{g.dups.reduce((n, s) => n + (s.qty - 1), 0)} extras</span>
          </div>
          <div className="list-stickers">
            {g.dups.map(s => (
              <div
                key={s.id}
                className={`list-chip dup ${s.rarity !== 'base' ? `rarity-${s.rarity}` : ''}`}
              >
                <span className="chip-id">{s.id}</span>
                {s.rarity && s.rarity !== 'base' && RARITY_COLORS[s.rarity] && (
                  <span
                    className="rarity-dot"
                    style={{ background: RARITY_COLORS[s.rarity], width: 8, height: 8, flexShrink: 0 }}
                  />
                )}
                <span className="chip-dup-badge">×{s.qty - 1}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
