import { useMemo, useState } from 'react'
import { SECTIONS } from '../data/stickers'

const writeClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  if (!copied) throw new Error('Clipboard unavailable')
}

const RARITY_COLORS = {
  base:   '#8d96a3',
  blue:   '#4da6ff',
  red:    '#ff5c5c',
  purple: '#b06efc',
  green:  '#39ff89',
  black:  '#e0e0e0',
}
const RARITY_ORDER = ['base', 'blue', 'red', 'purple', 'green', 'black']

const duplicateRarity = (variants = {}, fallback = 'base') => {
  for (let i = RARITY_ORDER.length - 1; i >= 0; i -= 1) {
    const rarity = RARITY_ORDER[i]
    if ((variants[rarity] || 0) > 1) return rarity
  }
  return fallback || 'base'
}

const variantSummary = (variants = {}) => {
  return Object.entries(variants)
    .filter(([, qty]) => qty > 0)
    .map(([rarity, qty]) => `${rarity[0].toUpperCase()}${rarity.slice(1)} ${qty}`)
    .join(' · ')
}

export default function Duplicates({ collection, readOnly = false }) {
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
          .map(st => ({
            ...st,
            qty: collection[st.id].qty,
            rarity: collection[st.id].rarity,
            duplicateRarity: duplicateRarity(collection[st.id].variants, collection[st.id].rarity),
            variants: collection[st.id].variants,
          })),
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
    writeClipboard(text)
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

      {!readOnly && (
        <>
          <div className="list-toolbar">
            <button className="btn btn-primary" onClick={copyTrade}>
              {copied ? '✓ Copied!' : '📋 Copy trade list'}
            </button>
          </div>
          {copyError && <div className="inline-error">{copyError}</div>}
        </>
      )}

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
                className={`list-chip dup rarity-${s.duplicateRarity}`}
              >
                <span className="chip-id">{s.id}</span>
                {s.variants && <span className="chip-variant-summary">{variantSummary(s.variants)}</span>}
                {s.duplicateRarity !== 'base' && RARITY_COLORS[s.duplicateRarity] && (
                  <span
                    className="rarity-dot"
                    style={{ background: RARITY_COLORS[s.duplicateRarity], width: 8, height: 8, flexShrink: 0 }}
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
