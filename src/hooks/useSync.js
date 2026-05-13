import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const DEBOUNCE_MS = 2000
const toTime = (value) => {
  const time = value ? new Date(value).getTime() : 0
  return Number.isFinite(time) ? time : 0
}

export function useSync(collection, session, loadCollection, lastUpdatedAt) {
  const initialLoadDone = useRef(false)
  const isSyncing = useRef(false)
  const loadedUserId = useRef(null)
  const debounceRef = useRef(null)
  const skipNextSave = useRef(false)
  const [syncStatus, setSyncStatus] = useState('idle')
  const [syncError, setSyncError] = useState('')
  const [lastSyncedAt, setLastSyncedAt] = useState(null)

  // On sign-in: load from Supabase, or upload existing localStorage data
  useEffect(() => {
    if (!session) {
      initialLoadDone.current = false
      isSyncing.current = false
      loadedUserId.current = null
      skipNextSave.current = false
      clearTimeout(debounceRef.current)
      setSyncStatus('idle')
      setSyncError('')
      setLastSyncedAt(null)
      return
    }

    const userId = session.user.id
    if (loadedUserId.current !== userId) {
      initialLoadDone.current = false
      loadedUserId.current = null
      skipNextSave.current = false
      clearTimeout(debounceRef.current)
    }

    if (initialLoadDone.current && loadedUserId.current === userId) return
    let cancelled = false

    const init = async () => {
      isSyncing.current = true
      setSyncStatus('loading')
      setSyncError('')

      const { data, error } = await supabase
        .from('collections')
        .select('data, updated_at')
        .eq('user_id', userId)
        .maybeSingle()

      if (cancelled) {
        isSyncing.current = false
        return
      }

      if (error) {
        console.error('Unable to load collection from Supabase', error)
        setSyncStatus('error')
        setSyncError('Cloud sync load failed. Local changes are still available on this device.')
      } else if (!data) {
        const updatedAt = lastUpdatedAt || new Date().toISOString()
        const { error: saveError } = await supabase.from('collections').upsert({
          user_id: userId,
          data: collection,
          updated_at: updatedAt,
        }, { onConflict: 'user_id' })

        if (cancelled) {
          isSyncing.current = false
          return
        }
        if (saveError) {
          console.error('Unable to create Supabase collection', saveError)
          setSyncStatus('error')
          setSyncError('Cloud sync setup failed. Changes are saved locally on this device.')
        } else {
          setLastSyncedAt(updatedAt)
          setSyncStatus('synced')
        }
      } else {
        const cloudTime = toTime(data.updated_at)
        const localTime = toTime(lastUpdatedAt)

        if (localTime > cloudTime) {
          const { error: saveError } = await supabase.from('collections').upsert({
            user_id: userId,
            data: collection,
            updated_at: lastUpdatedAt,
          }, { onConflict: 'user_id' })

          if (cancelled) {
            isSyncing.current = false
            return
          }
          if (saveError) {
            console.error('Unable to save newer local collection to Supabase', saveError)
            setSyncStatus('error')
            setSyncError('Cloud sync save failed. Newer local changes remain on this device.')
          } else {
            setLastSyncedAt(lastUpdatedAt)
            setSyncStatus('synced')
          }
        } else {
          skipNextSave.current = true
          loadCollection(data.data, data.updated_at)
          setLastSyncedAt(data.updated_at)
          setSyncStatus('synced')
        }
      }
      initialLoadDone.current = true
      loadedUserId.current = userId
      isSyncing.current = false
    }

    init()

    return () => {
      cancelled = true
    }
  }, [collection, lastUpdatedAt, loadCollection, session])

  // Auto-save on collection change (debounced)
  useEffect(() => {
    if (!session || !initialLoadDone.current || loadedUserId.current !== session.user.id || isSyncing.current) return

    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSyncStatus('saving')
      setSyncError('')
      const updatedAt = lastUpdatedAt || new Date().toISOString()
      const { error } = await supabase.from('collections').upsert({
        user_id: session.user.id,
        data: collection,
        updated_at: updatedAt,
      }, { onConflict: 'user_id' })

      if (error) {
        console.error('Unable to save collection to Supabase', error)
        setSyncStatus('error')
        setSyncError('Cloud sync save failed. Changes are saved locally on this device.')
      } else {
        setLastSyncedAt(updatedAt)
        setSyncStatus('synced')
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(debounceRef.current)
  }, [collection, lastUpdatedAt, session])

  useEffect(() => {
    if (!session) return

    const refreshFromCloud = async () => {
      if (document.visibilityState === 'hidden') return
      if (!initialLoadDone.current || loadedUserId.current !== session.user.id || isSyncing.current) return

      const { data, error } = await supabase
        .from('collections')
        .select('data, updated_at')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('Unable to refresh collection from Supabase', error)
        setSyncStatus('error')
        setSyncError('Cloud sync refresh failed. Local changes are still available on this device.')
        return
      }

      if (data && toTime(data.updated_at) > toTime(lastUpdatedAt)) {
        skipNextSave.current = true
        loadCollection(data.data, data.updated_at)
        setLastSyncedAt(data.updated_at)
        setSyncStatus('synced')
        setSyncError('')
      }
    }

    window.addEventListener('focus', refreshFromCloud)
    document.addEventListener('visibilitychange', refreshFromCloud)

    return () => {
      window.removeEventListener('focus', refreshFromCloud)
      document.removeEventListener('visibilitychange', refreshFromCloud)
    }
  }, [lastUpdatedAt, loadCollection, session])

  return { syncStatus, syncError, lastSyncedAt }
}
