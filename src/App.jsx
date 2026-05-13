import { useState } from 'react'
import NavBar     from './components/NavBar'
import Dashboard  from './pages/Dashboard'
import Album      from './pages/Album'
import Missing    from './pages/Missing'
import Duplicates from './pages/Duplicates'
import { useCollection } from './hooks/useCollection'

export default function App() {
  const [page, setPage] = useState('dashboard')
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
        />
      )}
      {page === 'album'   && <Album     {...sharedProps} />}
      {page === 'missing' && <Missing   collection={collection} />}
      {page === 'dupes'   && <Duplicates collection={collection} />}
    </>
  )
}
