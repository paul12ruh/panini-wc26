import { useState, useRef, useEffect } from 'react'

const TYPE_ICON = { foil: '✦', base: '○' }

export default function StickerSlot({ sticker, entry, onToggle, onSetQty, onSetRarity }) {
  const [open, setOpen] = useState(false)
  const [pos,  setPos]  = useState({ top: 0, left: 0 })
  const ref = useRef(null)

  const owned    = entry.qty > 0
  const rarity   = entry.rarity || 'base'
  const isDup    = entry.qty > 1
  const rarityClass = owned && rarity !== 'base' ? `rarity-${rarity}` : ''

  const openControls = (e) => {
    e.stopPropagation()
    const rect = ref.current.getBoundingClientRect()
    const winW = window.innerWidth
    let top  = rect.top - 210
    let left = rect.left + rect.width / 2 - 90
    if (top < 8) top = rect.bottom + 6
    if (left + 180 > winW - 8) left = winW - 188
    if (left < 8) left = 8
    setPos({ top, left })
    setOpen(true)
  }

  const handleClick = (e) => {
    e.stopPropagation()
    if (!owned) { onToggle(sticker.id); return }
    openControls(e)
  }

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    return () => window.removeEventListener('scroll', close, true)
  }, [open])

  return (
    <>
      <div
        ref={ref}
        className={`sticker-slot ${owned ? 'owned' : ''} ${rarityClass}`}
        onClick={handleClick}
        title={`${sticker.id} — ${sticker.name}`}
      >
        {owned && <div className="sticker-check">✓</div>}
        {isDup  && <div className="sticker-qty">×{entry.qty}</div>}
        <div className="sticker-id">{sticker.id}</div>
        <div className="sticker-icon">{TYPE_ICON[sticker.type] || '○'}</div>
        <div className="sticker-name">{sticker.name}</div>
      </div>

      {open && (
        <>
          <div className="popover-overlay" onClick={() => setOpen(false)} />
          <div
            className="sticker-controls"
            style={{ top: pos.top, left: pos.left }}
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div className="controls-title">Sticker</div>
              <div className="controls-sticker-id">{sticker.id} — {sticker.name}</div>
            </div>

            {/* Frame / rarity */}
            <div>
              <div className="controls-title" style={{ marginBottom: 6 }}>Frame</div>
              <div className="rarity-swatches">
                {[
                  { key: 'base',   color: '#555'    },
                  { key: 'blue',   color: '#4da6ff' },
                  { key: 'red',    color: '#ff5c5c' },
                  { key: 'purple', color: '#b06efc' },
                  { key: 'green',  color: '#39ff89' },
                  { key: 'black',  color: '#1a1a1a', border: '#e0e0e0' },
                ].map(({ key, color, border }) => (
                  <button
                    key={key}
                    className={`rarity-swatch ${rarity === key ? 'selected' : ''}`}
                    style={{ background: color, border: border ? `2px solid ${border}` : '2px solid transparent' }}
                    onClick={() => onSetRarity(sticker.id, key)}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <div className="controls-title" style={{ marginBottom: 6 }}>Quantity</div>
              <div className="qty-row">
                <button className="qty-btn" onClick={() => onSetQty(sticker.id, entry.qty - 1)}>−</button>
                <div className="qty-value">{entry.qty}</div>
                <button className="qty-btn" onClick={() => onSetQty(sticker.id, entry.qty + 1)}>+</button>
              </div>
            </div>

            {/* Unmark — prominent, can't miss it */}
            <button
              className="unmark-btn"
              onClick={() => { onToggle(sticker.id); setOpen(false) }}
            >
              ✕ Unmark sticker
            </button>
          </div>
        </>
      )}
    </>
  )
}
