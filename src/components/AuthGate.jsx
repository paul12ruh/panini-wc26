import { useState } from 'react'

export default function AuthGate({ signIn, signInWithGoogle }) {
  const [showEmail, setShowEmail] = useState(false)
  const [email,     setEmail]     = useState('')
  const [sent,      setSent]      = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

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
        <div className="auth-sub">Sign in to sync your collection across devices.</div>

        {sent ? (
          <div className="auth-sub" style={{ marginTop: 16 }}>
            Magic link sent to <strong>{email}</strong> — check your inbox.
          </div>
        ) : !showEmail ? (
          <>
            <button className="btn btn-primary auth-btn auth-google-btn" onClick={signInWithGoogle}>
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: 8, flexShrink: 0 }}>
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              Sign in with Google
            </button>
            <button className="btn btn-ghost auth-btn" style={{ marginTop: 8, fontSize: 13 }} onClick={() => setShowEmail(true)}>
              Use email magic link instead
            </button>
          </>
        ) : (
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
            <button type="button" className="btn btn-ghost auth-btn" style={{ marginTop: 4, fontSize: 13 }} onClick={() => setShowEmail(false)}>
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
