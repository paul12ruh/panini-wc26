import { useState } from 'react'
import NavBar     from './components/NavBar'
import Dashboard  from './pages/Dashboard'
import Album      from './pages/Album'
import Missing    from './pages/Missing'
import Duplicates from './pages/Duplicates'
import Stats      from './pages/Stats'
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
    setQty, setRarity,
    owned, duplicates, loadCollection, lastUpdatedAt,
  } = useCollection()

  const { session, loading: authLoading, signIn, signInWithGoogle, signOut } = useAuth()
  const { syncStatus, syncError } = useSync(collection, session, loadCollection, lastUpdatedAt)

  if (authLoading) return <div className="auth-loading">Loading…</div>
  if (!session)    return <AuthGate signIn={signIn} signInWithGoogle={signInWithGoogle} />

  const sharedProps = { collection, get, toggle, setQty, setRarity }

  return (
    <>
      <NavBar
        page={page}
        setPage={setPage}
        owned={owned}
        signOut={signOut}
        syncStatus={syncStatus}
        syncError={syncError}
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

      <VoiceInput collection={collection} onMark={toggle} />
    </>
  )
}
