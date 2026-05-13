import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const DEBOUNCE_MS = 2000

export function useSync(collection, session, loadCollection) {
  const initialLoadDone = useRef(false)
  const isSyncing = useRef(false)
  const debounceRef = useRef(null)

  // On sign-in: load from Supabase, or upload existing localStorage data
  useEffect(() => {
    if (!session || initialLoadDone.current) return

    const init = async () => {
      isSyncing.current = true
      const { data, error } = await supabase
        .from('collections')
        .select('data')
        .eq('user_id', session.user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // No cloud record yet — push current localStorage data up
        await supabase.from('collections').insert({
          user_id: session.user.id,
          data: collection,
          updated_at: new Date().toISOString(),
        })
      } else if (!error && data?.data) {
        loadCollection(data.data)
      }
      initialLoadDone.current = true
      isSyncing.current = false
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  // Auto-save on collection change (debounced)
  useEffect(() => {
    if (!session || !initialLoadDone.current || isSyncing.current) return

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      await supabase.from('collections').upsert({
        user_id: session.user.id,
        data: collection,
        updated_at: new Date().toISOString(),
      })
    }, DEBOUNCE_MS)

    return () => clearTimeout(debounceRef.current)
  }, [collection, session])
}
