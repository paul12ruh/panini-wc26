import { useState, useMemo, useEffect } from 'react'
import { SECTIONS, CONFEDERATIONS } from '../data/stickers'
import StickerSlot from '../components/StickerSlot'

const DEFAULT_ENTRY = { qty: 0, rarity: 'base' }

export default function Album({ collection, get, toggle, setQty, setRarity, focusSection, setFocusSection, setPage }) {
  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState('All')
  const [expanded,    setExpanded]    = useState({})
  const [allExpanded, setAllExpanded] = useState(false)

  const toggle_section = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }))

  // Deep-link: expand and scroll to focusSection when set
  useEffect(() => {
    if (!focusSection) return
    const match = SECTIONS.find(s => s.id === focusSection)
    if (!match) { setFocusSection(null); return }
    setExpanded(p => ({ ...p, [focusSection]: true }))
    // Use a small timeout to let the DOM update before scrolling
    const timer = setTimeout(() => {
      const el = document.getElementById(`section-${focusSection}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      setFocusSection(null)
    }, 80)
    return () => clearTimeout(timer)
  }, [focusSection, setFocusSection])

  // Expand-all / Collapse-all handler
  const handleToggleAll = () => {
    if (allExpanded) {
      setExpanded({})
    } else {
      const all = {}
      filtered.forEach(s => { all[s.id] = true })
      setExpanded(all)
    }
    setAllExpanded(p => !p)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return SECTIONS.filter(s => {
      if (filter !== 'All') {
        if (filter === 'Intro' && s.type !== 'intro') return false
        if (filter !== 'Intro' && s.confederation !== filter) return false
      }
      if (!q) return true
      if (s.name.toLowerCase().includes(q)) return true
      if (s.id.toLowerCase().includes(q)) return true
      return s.stickers.some(st =>
        st.id.toLowerCase().includes(q) || st.name.toLowerCase().includes(q)
      )
    })
  }, [search, filter])

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost" style={{ marginBottom: 8, fontSize: 13 }} onClick={() => setPage('dashboard')}>
          ← Dashboard
        </button>
        <div className="page-title">Album</div>
        <div className="page-subtitle">Click a sticker to mark it owned · click again to adjust quantity & frame</div>
      </div>

      <div className="album-toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search sticker, team…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-ghost" onClick={handleToggleAll}>
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
        <div className="filter-chips">
          {['All', 'Intro', ...CONFEDERATIONS].map(f => (
            <button
              key={f}
              className={`chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="album-sections">
        {filtered.map(section => {
          const ownedCount = section.stickers.filter(s => collection[s.id]?.qty > 0).length
          const pct        = Math.round((ownedCount / section.stickers.length) * 100)
          const isOpen     = expanded[section.id]

          return (
            <div key={section.id} id={`section-${section.id}`} className="team-section glass">
              <div
                className="team-section-header"
                onClick={() => toggle_section(section.id)}
              >
                <div className="ts-flag">{section.flag || (section.type === 'intro' ? '🏆' : '')}</div>
                <div className="ts-info">
                  <div className="ts-name">{section.name}</div>
                  <div className="ts-sub">
                    {section.confederation || 'Introduction'} · {ownedCount}/{section.stickers.length} owned
                  </div>
                </div>
                <div className="ts-progress">
                  <div className={`ts-pct ${pct === 100 ? 'done' : ''}`}>{pct}%</div>
                  <div className="ts-bar">
                    <div className={`ts-bar-fill ${pct === 100 ? 'done' : ''}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className={`ts-chevron ${isOpen ? 'open' : ''}`}>▾</div>
                </div>
              </div>

              {isOpen && (
                <div className="sticker-grid">
                  {section.stickers.map(sticker => (
                    <StickerSlot
                      key={sticker.id}
                      sticker={sticker}
                      entry={collection[sticker.id] ?? DEFAULT_ENTRY}
                      onToggle={toggle}
                      onSetQty={setQty}
                      onSetRarity={setRarity}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
