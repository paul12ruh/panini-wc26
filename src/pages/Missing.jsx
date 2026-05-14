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

export default function Missing({ collection, readOnly = false }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')

  const groups = useMemo(() => {
    return SECTIONS
      .map(s => ({
        ...s,
        missing: s.stickers.filter(st => !(collection[st.id]?.qty > 0)),
      }))
      .filter(s => s.missing.length > 0)
  }, [collection])

  const total = groups.reduce((n, g) => n + g.missing.length, 0)

  const copyList = () => {
    const lines = groups.map(g =>
      `${g.name}:\n  ${g.missing.map(s => s.id).join(', ')}`
    )
    const text = `Missing stickers (${total} total)\n\n${lines.join('\n\n')}`
    setCopyError('')
    writeClipboard(text)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => setCopyError('Copy failed. Your browser may require HTTPS or clipboard permission.'))
  }

  const exportTxt = () => {
    const lines = groups.map(g =>
      `${g.name}:\n  ${g.missing.map(s => s.id).join(', ')}`
    )
    const text = `Missing stickers (${total} total)\n\n${lines.join('\n\n')}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = 'missing-stickers.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  if (groups.length === 0) return (
    <div className="page">
      <div className="empty">
        <div className="empty-icon">🏆</div>
        <div className="empty-title">Album Complete!</div>
        <div className="empty-sub">You have every single sticker. Legendary.</div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Missing Stickers</div>
        <div className="page-subtitle">{total} stickers still needed across {groups.length} sections</div>
      </div>

      {!readOnly && (
        <>
          <div className="list-toolbar">
            <button className="btn btn-primary" onClick={copyList}>
              {copied ? '✓ Copied!' : '📋 Copy list'}
            </button>
            <button className="btn btn-ghost" onClick={exportTxt}>
              ⬇ Export .txt
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
            <span className="group-count">{g.missing.length} missing</span>
          </div>
          <div className="missing-table">
            {g.missing.map(s => (
              <div key={s.id} className="missing-row">
                <span className="missing-id">{s.id}</span>
                <span className="missing-name">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
