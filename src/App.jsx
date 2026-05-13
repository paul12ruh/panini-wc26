import { useState } from 'react'
import NavBar     from './components/NavBar'
import Dashboard  from './pages/Dashboard'
import Album      from './pages/Album'
import Missing    from './pages/Missing'
import Duplicates from './pages/Duplicates'
import Stats      from './pages/Stats'
import Tools      from './pages/Tools'
import VoiceInput from './components/VoiceInput'
import { useCollection } from './hooks/useCollection'
import { useAuth } from './hooks/useAuth'
import { useSync } from './hooks/useSync'
import AuthGate from './components/AuthGate'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [focusSection, setFocusSection] = useState(null)
  const [heatmapSort, setHeatmapSort] = useState('group')
  const {
    collection, get, toggle,
    setQty, setRarity, setVariantQty,
    owned, duplicates, loadCollection, lastUpdatedAt,
    activity, undoLastActivity,
  } = useCollection()

  const { session, loading: authLoading, signIn, signInWithGoogle, signOut } = useAuth()
  const syncSession = session?.__mock ? null : session
  const { syncStatus, syncError, lastSyncedAt } = useSync(collection, syncSession, loadCollection, lastUpdatedAt)

  if (authLoading) return <div className="auth-loading">Loading…</div>
  if (!session)    return <AuthGate signIn={signIn} signInWithGoogle={signInWithGoogle} />

  const sharedProps = { collection, get, toggle, setQty, setRarity, setVariantQty }

  return (
    <>
      <NavBar
        page={page}
        setPage={setPage}
        owned={owned}
        signOut={signOut}
        syncStatus={syncStatus}
        syncError={syncError}
        lastSyncedAt={lastSyncedAt}
        syncDisabled={Boolean(session?.__mock)}
      />

      {page === 'dashboard' && (
        <Dashboard
          collection={collection}
          owned={owned}
          duplicates={duplicates}
          setPage={setPage}
          setFocusSection={setFocusSection}
          heatmapSort={heatmapSort}
          setHeatmapSort={setHeatmapSort}
        />
      )}
      {page === 'album'   && (
        <Album
          {...sharedProps}
          focusSection={focusSection}
          setFocusSection={setFocusSection}
          setPage={setPage}
        />
      )}
      {page === 'missing' && <Missing   collection={collection} />}
      {page === 'dupes'   && <Duplicates collection={collection} />}
      {page === 'stats'   && <Stats collection={collection} />}
      {page === 'tools'   && (
        <Tools
          collection={collection}
          setRarity={setRarity}
          activity={activity}
          undoLastActivity={undoLastActivity}
          owned={owned}
          duplicates={duplicates}
        />
      )}

      <VoiceInput collection={collection} onMark={toggle} onSetRarity={setRarity} />
    </>
  )
}
