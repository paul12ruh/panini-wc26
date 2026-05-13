import { useState, useRef, useEffect } from 'react'

const TYPE_ICON = {
  foil:   '✦',
  base:   '○',
}

export default function StickerSlot({ sticker, entry, onToggle, onSetQty, onSetRarity }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0 })
  const ref = useRef(null)

  const owned    = entry.qty > 0
  const rarity   = entry.rarity || 'base'
  const isDup    = entry.qty > 1
  const rarityClass = owned && rarity !== 'base' ? `rarity-${rarity}` : ''

  const handleClick = (e) => {
    e.stopPropagation()
    if (!owned) {
      onToggle(sticker.id)
      return
    }
    const rect = ref.current.getBoundingClientRect()
    const winW = window.innerWidth
    const winH = window.innerHeight
    let top  = rect.top - 4
    let left = rect.left + rect.width / 2 - 85
    if (top - 200 < 8) top = rect.bottom + 4
    else top = rect.top - 200
    if (left + 170 > winW - 8) left = winW - 178
    if (left < 8) left = 8
    setPos({ top, left })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
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
              <div className="controls-sticker-id">{sticker.id}</div>
            </div>

            <div>
              <div className="controls-title" style={{ marginBottom: 6 }}>Quantity</div>
              <div className="qty-row">
                <button className="qty-btn" onClick={() => { onSetQty(sticker.id, entry.qty - 1); if (entry.qty <= 1) setOpen(false) }}>−</button>
                <div className="qty-value">{entry.qty}</div>
                <button className="qty-btn" onClick={() => onSetQty(sticker.id, entry.qty + 1)}>+</button>
              </div>
            </div>

            <div>
              <div className="controls-title" style={{ marginBottom: 6 }}>Frame</div>
              <div className="rarity-row">
                {['base', 'blue', 'green'].map(r => (
                  <button
                    key={r}
                    className={`rarity-btn ${rarity === r ? `active-${r}` : ''}`}
                    onClick={() => onSetRarity(sticker.id, r)}
                  >
                    {r === 'base' ? 'Base' : r === 'blue' ? '🔵 Blue' : '🟢 Green'}
                  </button>
                ))}
              </div>
            </div>

            <button className="controls-close" onClick={() => setOpen(false)}>Done</button>
          </div>
        </>
      )}
    </>
  )
}
