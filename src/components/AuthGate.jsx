import { useState } from 'react'

export default function AuthGate({ signIn }) {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email)
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="auth-gate">
      <div className="auth-card glass">
        <div className="auth-logo">⚽</div>
        <div className="auth-title">Panini WC26</div>
        <div className="auth-sub">
          {sent
            ? `Magic link sent to ${email} — check your inbox and click the link.`
            : 'Sign in to sync your collection across devices.'}
        </div>
        {!sent && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              className="auth-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
            {error && <div className="auth-error">{error}</div>}
            <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
