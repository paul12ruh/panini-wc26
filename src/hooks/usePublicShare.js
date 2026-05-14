import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { normalizeCollection } from './useCollection'

const REFRESH_MS = 30000

export function usePublicShare(slug) {
  const [collection, setCollection] = useState({})
  const [updatedAt, setUpdatedAt] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const loadShare = useCallback(async () => {
    if (!slug) {
      setStatus('not_found')
      setError('')
      return
    }

    setStatus(current => current === 'ready' ? 'refreshing' : 'loading')
    setError('')

    const { data, error: rpcError } = await supabase
      .rpc('get_shared_collection', { share_slug: slug })

    if (rpcError) {
      console.error('Unable to load shared collection', rpcError)
      setStatus('error')
      setError('Unable to load this shared collection.')
      return
    }

    const row = Array.isArray(data) ? data[0] : data
    if (!row) {
      setStatus('not_found')
      setCollection({})
      setUpdatedAt(null)
      return
    }

    setCollection(normalizeCollection(row.collection_data))
    setUpdatedAt(row.collection_updated_at || null)
    setStatus('ready')
  }, [slug])

  useEffect(() => {
    loadShare()
    const timer = setInterval(loadShare, REFRESH_MS)
    return () => clearInterval(timer)
  }, [loadShare])

  return { collection, updatedAt, status, error, refresh: loadShare }
}
