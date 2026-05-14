import { useState } from 'react'
import { useShareLink } from '../hooks/useShareLink'

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

export default function ShareLinkControls({ disabled }) {
  const { share, shareUrl, status, error, createOrReplace, disableShare } = useShareLink({ disabled })
  const [copied, setCopied] = useState(false)

  const busy = status === 'loading' || status === 'saving'
  const handleCopy = () => {
    if (!shareUrl) return
    writeClipboard(shareUrl)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      })
      .catch(() => setCopied(false))
  }

  if (disabled) {
    return (
      <div className="share-link-box">
        <div className="tool-note">Share links require a real signed-in Supabase session. They are disabled in local dev mock auth.</div>
      </div>
    )
  }

  return (
    <div className="share-link-box">
      {share ? (
        <>
          <input className="tool-input share-link-input" value={shareUrl} readOnly aria-label="Read-only share link" />
          <div className="tool-actions tool-actions-wrap">
            <button className="btn btn-primary" onClick={handleCopy} disabled={busy}>
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <button className="btn btn-ghost" onClick={createOrReplace} disabled={busy}>
              Regenerate
            </button>
            <button className="btn btn-danger" onClick={disableShare} disabled={busy}>
              Disable
            </button>
          </div>
        </>
      ) : (
        <button className="btn btn-primary" onClick={createOrReplace} disabled={busy}>
          {busy ? 'Creating...' : 'Create share link'}
        </button>
      )}
      {status === 'loading' && <div className="tool-note">Loading share link...</div>}
      {error && <div className="tool-warning" role="status">{error}</div>}
      {share && <div className="tool-note">Anyone with this link can view your current synced progress. They cannot edit.</div>}
    </div>
  )
}
