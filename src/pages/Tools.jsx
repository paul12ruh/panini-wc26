import { useMemo, useState } from 'react'
import { ALL_STICKERS, SECTIONS, TEAMS, TOTAL } from '../data/stickers'

const RARITIES = ['base', 'blue', 'red', 'purple', 'green', 'black']
const TEAM_NAME_TO_CODE = Object.fromEntries(
  TEAMS.flatMap(team => [
    [team.code.toLowerCase(), team.code],
    [team.name.toLowerCase(), team.code],
  ])
)
const STICKER_MAP = Object.fromEntries(ALL_STICKERS.map(sticker => [sticker.id, sticker]))

const normalizeText = value => value.toLowerCase().trim().replace(/\s+/g, ' ')

const parseStickerInput = (raw) => {
  const text = normalizeText(raw)
  if (!text) return null

  const direct = text.toUpperCase()
  if (STICKER_MAP[direct]) return direct

  const match = text.match(/^(.+?)\s+(\d{1,2})$/)
  if (match) {
    const code = TEAM_NAME_TO_CODE[match[1]]
    if (code) {
      const id = `${code}-${Number(match[2])}`
      if (STICKER_MAP[id]) return id
    }
  }

  const byName = ALL_STICKERS.find(sticker => normalizeText(sticker.name) === text)
  return byName?.id || null
}

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

const buildTradeText = (collection) => {
  const missing = []
  const duplicates = []

  SECTIONS.forEach(section => {
    const missingIds = section.stickers
      .filter(sticker => !(collection[sticker.id]?.qty > 0))
      .map(sticker => sticker.id)
    const duplicateIds = section.stickers
      .filter(sticker => collection[sticker.id]?.qty > 1)
      .map(sticker => {
        const extra = collection[sticker.id].qty - 1
        return extra > 1 ? `${sticker.id}x${extra}` : sticker.id
      })

    if (missingIds.length) missing.push(`${section.name}: ${missingIds.join(', ')}`)
    if (duplicateIds.length) duplicates.push(`${section.name}: ${duplicateIds.join(', ')}`)
  })

  return [
    'Panini WC26 trade sheet',
    '',
    `Missing (${missing.reduce((sum, line) => sum + line.split(': ')[1].split(', ').length, 0)}):`,
    missing.join('\n') || 'None',
    '',
    'Duplicates:',
    duplicates.join('\n') || 'None',
  ].join('\n')
}

export default function Tools({ collection, setRarity, activity, undoLastActivity, owned, duplicates }) {
  const [quickValue, setQuickValue] = useState('')
  const [quickRarity, setQuickRarity] = useState('base')
  const [quickMessage, setQuickMessage] = useState('')
  const [packText, setPackText] = useState('')
  const [packRarity, setPackRarity] = useState('base')
  const [packMessage, setPackMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const tradeText = useMemo(() => buildTradeText(collection), [collection])

  const insights = useMemo(() => {
    const ownedSections = SECTIONS.map(section => {
      const sectionOwned = section.stickers.filter(sticker => collection[sticker.id]?.qty > 0).length
      return { ...section, owned: sectionOwned, total: section.stickers.length, pct: Math.round((sectionOwned / section.stickers.length) * 100) }
    })
    const duplicateEntries = ALL_STICKERS
      .map(sticker => ({ ...sticker, extra: Math.max(0, (collection[sticker.id]?.qty || 0) - 1) }))
      .filter(sticker => sticker.extra > 0)
      .sort((a, b) => b.extra - a.extra)

    const variantTotals = RARITIES.reduce((totals, rarity) => {
      totals[rarity] = Object.values(collection).reduce((sum, entry) => sum + (entry.variants?.[rarity] || 0), 0)
      return totals
    }, {})

    return {
      pct: TOTAL ? Math.round((owned / TOTAL) * 100) : 0,
      closest: ownedSections.filter(section => section.pct < 100).sort((a, b) => b.pct - a.pct)[0],
      weakest: ownedSections.filter(section => section.pct < 100).sort((a, b) => a.pct - b.pct)[0],
      topDuplicate: duplicateEntries[0],
      variantTotals,
    }
  }, [collection, owned])

  const addSticker = (value, rarity) => {
    const stickerId = parseStickerInput(value)
    if (!stickerId) return null
    setRarity(stickerId, rarity)
    return stickerId
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    const stickerId = addSticker(quickValue, quickRarity)
    if (!stickerId) {
      setQuickMessage('No matching sticker found.')
      return
    }
    setQuickMessage(`Added ${quickRarity} ${stickerId}.`)
    setQuickValue('')
  }

  const handleCommitPack = () => {
    const tokens = packText.split(/[\n,]+/).map(item => item.trim()).filter(Boolean)
    const added = []
    const missed = []

    tokens.forEach(token => {
      const stickerId = addSticker(token, packRarity)
      if (stickerId) added.push(stickerId)
      else missed.push(token)
    })

    setPackMessage(`Added ${added.length} sticker${added.length === 1 ? '' : 's'}${missed.length ? `; ${missed.length} not found.` : '.'}`)
    if (!missed.length) setPackText('')
  }

  const handleCopyTrade = () => {
    writeClipboard(tradeText)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      })
      .catch(() => setCopied(false))
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Tools</div>
        <div className="page-subtitle">Fast entry, pack review, trading, recent changes, and collection insights.</div>
      </div>

      <div className="tools-grid">
        <section className="tool-panel glass">
          <div className="section-title">Mobile Quick Add</div>
          <form className="tool-form" onSubmit={handleQuickAdd}>
            <input
              className="tool-input"
              value={quickValue}
              onChange={e => setQuickValue(e.target.value)}
              placeholder="MEX-2, Mexico 2, or player name"
              aria-label="Sticker to add"
            />
            <select className="tool-select" value={quickRarity} onChange={e => setQuickRarity(e.target.value)} aria-label="Color">
              {RARITIES.map(rarity => <option key={rarity} value={rarity}>{rarity}</option>)}
            </select>
            <button className="btn btn-primary" type="submit">Add</button>
          </form>
          {quickMessage && <div className="tool-note">{quickMessage}</div>}
        </section>

        <section className="tool-panel glass">
          <div className="section-title">Pack Opening</div>
          <textarea
            className="tool-textarea"
            value={packText}
            onChange={e => setPackText(e.target.value)}
            placeholder="Enter one sticker per line or comma-separated: MEX-2, France 7, Messi"
            aria-label="Pack stickers"
          />
          <div className="tool-actions">
            <select className="tool-select" value={packRarity} onChange={e => setPackRarity(e.target.value)} aria-label="Pack color">
              {RARITIES.map(rarity => <option key={rarity} value={rarity}>{rarity}</option>)}
            </select>
            <button className="btn btn-primary" onClick={handleCommitPack}>Commit Pack</button>
          </div>
          {packMessage && <div className="tool-note">{packMessage}</div>}
        </section>

        <section className="tool-panel glass">
          <div className="section-title">Trade / Share</div>
          <textarea className="tool-textarea trade-textarea" value={tradeText} readOnly aria-label="Trade sheet" />
          <button className="btn btn-primary" onClick={handleCopyTrade}>{copied ? 'Copied' : 'Copy trade sheet'}</button>
        </section>

        <section className="tool-panel glass">
          <div className="section-title">Recent Activity</div>
          <button className="btn btn-ghost" onClick={undoLastActivity} disabled={!activity.length}>Undo last change</button>
          <div className="activity-list">
            {activity.slice(0, 8).map(item => (
              <div key={item.id} className="activity-row">
                <span className="activity-id">{item.stickerId}</span>
                <span>{item.action}</span>
              </div>
            ))}
            {!activity.length && <div className="panel-empty">No recent changes yet.</div>}
          </div>
        </section>

        <section className="tool-panel glass tool-panel-wide">
          <div className="section-title">Collection Insights</div>
          <div className="insight-grid">
            <div className="insight-card"><span>Completion</span><strong>{insights.pct}%</strong></div>
            <div className="insight-card"><span>Duplicates</span><strong>{duplicates}</strong></div>
            <div className="insight-card"><span>Closest section</span><strong>{insights.closest ? `${insights.closest.name} ${insights.closest.pct}%` : 'Complete'}</strong></div>
            <div className="insight-card"><span>Needs focus</span><strong>{insights.weakest ? `${insights.weakest.name} ${insights.weakest.pct}%` : 'Complete'}</strong></div>
            <div className="insight-card"><span>Top duplicate</span><strong>{insights.topDuplicate ? `${insights.topDuplicate.id} +${insights.topDuplicate.extra}` : 'None'}</strong></div>
            <div className="insight-card"><span>Variants</span><strong>{RARITIES.map(rarity => `${rarity[0].toUpperCase()}:${insights.variantTotals[rarity]}`).join(' ')}</strong></div>
          </div>
        </section>
      </div>
    </div>
  )
}
