import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DEV_AUTH_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_AUTH === 'true'
const DEV_SESSION = {
  __mock: true,
  user: {
    id: 'local-dev-user',
    email: 'dev@example.local',
  },
}

export function useAuth() {
  const [session, setSession] = useState(DEV_AUTH_ENABLED ? DEV_SESSION : null)
  const [loading, setLoading] = useState(!DEV_AUTH_ENABLED)

  useEffect(() => {
    if (DEV_AUTH_ENABLED) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email) => {
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
  }

  const signInWithGoogle = () => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })

  const signOut = () => supabase.auth.signOut()

  const devSignOut = () => {
    setSession(null)
    return Promise.resolve()
  }

  return {
    session,
    loading,
    signIn,
    signInWithGoogle,
    signOut: DEV_AUTH_ENABLED ? devSignOut : signOut,
  }
}
