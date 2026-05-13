import { useState } from 'react'
import NavBar     from './components/NavBar'
import Dashboard  from './pages/Dashboard'
import Album      from './pages/Album'
import Missing    from './pages/Missing'
import Duplicates from './pages/Duplicates'
import Stats      from './pages/Stats'
import VoiceInput from './components/VoiceInput'
import { useCollection } from './hooks/useCollection'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [focusSection, setFocusSection] = useState(null)
  const {
    collection, get, toggle,
    setQty, setRarity,
    exportJSON, importJSON,
    owned, duplicates,
  } = useCollection()

  const sharedProps = { collection, get, toggle, setQty, setRarity }

  return (
    <>
      <NavBar page={page} setPage={setPage} owned={owned} />

      {page === 'dashboard' && (
        <Dashboard
          collection={collection}
          owned={owned}
          duplicates={duplicates}
          setPage={setPage}
          setFocusSection={setFocusSection}
        />
      )}
      {page === 'album'   && (
        <Album
          {...sharedProps}
          focusSection={focusSection}
          setFocusSection={setFocusSection}
        />
      )}
      {page === 'missing' && <Missing   collection={collection} />}
      {page === 'dupes'   && <Duplicates collection={collection} />}
      {page === 'stats'   && <Stats collection={collection} />}

      <VoiceInput collection={collection} onMark={toggle} />
    </>
  )
}
