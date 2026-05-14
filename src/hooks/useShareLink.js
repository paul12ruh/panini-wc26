import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const getShareErrorMessage = (error, action) => {
  const message = error?.message || ''
  const details = error?.details || ''
  const code = error?.code || ''
  const combined = `${message} ${details}`.toLowerCase()
  const diagnostic = [code, message, details].filter(Boolean).join(' - ')

  if (combined.includes('authentication required') || combined.includes('jwt')) {
    return 'Unable to create share link because this browser is not signed in to Supabase on this URL. Sign out and sign back in on the preview URL, then try again.'
  }

  if (combined.includes('function') && combined.includes('schema cache')) {
    return 'Unable to create share link because the Supabase share-link migration is not available yet. Refresh after the migration finishes, then try again.'
  }

  if (combined.includes('collection_shares')) {
    return 'Unable to create share link because the collection_shares table is unavailable. Confirm the read-only share-link migration ran successfully.'
  }

  return diagnostic
    ? `Unable to ${action} share link: ${diagnostic}`
    : `Unable to ${action} share link.`
}

export function useShareLink({ disabled = false } = {}) {
  const [share, setShare] = useState(null)
  const [status, setStatus] = useState(disabled ? 'disabled' : 'idle')
  const [error, setError] = useState('')

  const shareUrl = useMemo(() => (
    share?.slug ? `${window.location.origin}/share/${share.slug}` : ''
  ), [share])

  const loadShare = useCallback(async () => {
    if (disabled) {
      setStatus('disabled')
      setShare(null)
      return
    }

    setStatus('loading')
    setError('')
    const { data, error: loadError } = await supabase
      .from('collection_shares')
      .select('id, slug, enabled, created_at, updated_at')
      .eq('enabled', true)
      .maybeSingle()

    if (loadError) {
      console.error('Unable to load collection share', loadError)
      setStatus('error')
      setError(getShareErrorMessage(loadError, 'load'))
      return
    }

    setShare(data)
    setStatus('ready')
  }, [disabled])

  useEffect(() => {
    loadShare()
  }, [loadShare])

  const createOrReplace = useCallback(async () => {
    if (disabled) return null
    setStatus('saving')
    setError('')
    const { data, error: rpcError } = await supabase.rpc('create_or_replace_collection_share')

    if (rpcError) {
      console.error('Unable to create collection share', rpcError)
      setStatus('error')
      setError(getShareErrorMessage(rpcError, 'create'))
      return null
    }

    setShare(data)
    setStatus('ready')
    return data
  }, [disabled])

  const disableShare = useCallback(async () => {
    if (disabled || !share?.id) return
    setStatus('saving')
    setError('')
    const { error: rpcError } = await supabase.rpc('disable_collection_share', { share_id: share.id })

    if (rpcError) {
      console.error('Unable to disable collection share', rpcError)
      setStatus('error')
      setError(getShareErrorMessage(rpcError, 'disable'))
      return
    }

    setShare(null)
    setStatus('ready')
  }, [disabled, share?.id])

  return {
    share,
    shareUrl,
    status,
    error,
    refresh: loadShare,
    createOrReplace,
    disableShare,
  }
}
