import { memo, useState, useRef, useEffect } from 'react'

const RARITIES = [
  { key: 'base',   label: 'Base',   color: '#555'    },
  { key: 'blue',   label: 'Blue',   color: '#4da6ff' },
  { key: 'red',    label: 'Red',    color: '#ff5c5c' },
  { key: 'purple', label: 'Purple', color: '#b06efc' },
  { key: 'green',  label: 'Green',  color: '#39ff89' },
  { key: 'black',  label: 'Black',  color: '#1a1a1a', border: '#e0e0e0' },
]

function StickerSlot({ sticker, entry, onToggle, onSetQty, onSetRarity }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const closeRef = useRef(null)

  const owned    = entry.qty > 0
  const rarity   = entry.rarity || 'base'
  const isDup    = entry.qty > 1
  const rarityClass = owned && rarity !== 'base' ? `rarity-${rarity}` : ''

  const openControls = (e) => {
    e.stopPropagation()
    setOpen(true)
  }

  const closeControls = () => {
    setOpen(false)
    requestAnimationFrame(() => ref.current?.focus())
  }

  const handleClick = (e) => {
    e.stopPropagation()
    if (owned) {
      setOpen(true)
    } else {
      onToggle(sticker.id)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    if (owned) {
      setOpen(true)
    } else {
      onToggle(sticker.id)
    }
  }

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeControls()
        return
      }

      if (e.key !== 'Tab') return
      const focusable = Array.from(
        document.querySelectorAll(
          '.sticker-controls button:not([disabled]), .sticker-controls [href], .sticker-controls input, .sticker-controls select, .sticker-controls textarea, .sticker-controls [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <div
        ref={ref}
        className={`sticker-slot ${owned ? 'owned' : ''} ${rarityClass}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-pressed={owned}
        title={`${sticker.id} — ${sticker.name}`}
      >
        {owned && <div className="sticker-check">✓</div>}
        {owned && <button className="sticker-edit" onClick={openControls} title="Edit sticker" aria-label={`Edit ${sticker.id}`}>⋯</button>}
        {isDup  && <div className="sticker-qty">×{entry.qty}</div>}
        <div className="sticker-id">{sticker.id}</div>
        <div className="sticker-name">{sticker.name}</div>
      </div>

      {open && (
        <>
          <div className="popover-overlay" onClick={closeControls} />
          <div
            className="sticker-controls"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`controls-title-${sticker.id}`}
          >
            <div className="controls-header">
              <div>
                <div className="controls-title">Sticker</div>
                <div className="controls-sticker-id" id={`controls-title-${sticker.id}`}>{sticker.id} — {sticker.name}</div>
              </div>
              <button ref={closeRef} className="controls-close" onClick={closeControls} title="Close" aria-label="Close sticker controls">✕</button>
            </div>

            <div>
              <div className="controls-title" style={{ marginBottom: 8 }}>Rarity</div>
              <div className="rarity-grid">
                {RARITIES.map(({ key, label, color, border }) => (
                  <button
                    key={key}
                    className={`rarity-tile ${rarity === key ? 'selected' : ''}`}
                    onClick={() => onSetRarity(sticker.id, key)}
                  >
                    <span
                      className="rarity-tile-dot"
                      style={{ background: color, border: border ? `2px solid ${border}` : '2px solid transparent' }}
                    />
                    <span className="rarity-tile-label">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="controls-title" style={{ marginBottom: 8 }}>Quantity</div>
              <div className="qty-row">
                <button
                  className="qty-btn"
                  onClick={() => onSetQty(sticker.id, entry.qty - 1)}
                  disabled={entry.qty <= 1}
                  aria-label={`Decrease ${sticker.id} quantity`}
                >
                  −
                </button>
                <div className="qty-value">{entry.qty}</div>
                <button className="qty-btn" onClick={() => onSetQty(sticker.id, entry.qty + 1)} aria-label={`Increase ${sticker.id} quantity`}>+</button>
              </div>
            </div>

            <button
              className="unmark-btn"
              onClick={() => { onSetQty(sticker.id, 0); closeControls() }}
            >
              ✕ Unmark sticker
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default memo(StickerSlot)
