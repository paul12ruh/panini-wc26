import { useState, useCallback } from 'react'

const STORAGE_KEY = 'panini-wc2026'

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const save = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// collection shape: { [stickerId]: { qty: number, rarity: 'base' | 'blue' | 'green' } }
// a sticker is "owned" when qty >= 1

export function useCollection() {
  const [collection, setCollection] = useState(load)

  const get = useCallback((id) => collection[id] || { qty: 0, rarity: 'base' }, [collection])

  const toggle = useCallback((id) => {
    setCollection(prev => {
      const next = { ...prev }
      if (next[id]?.qty > 0) {
        delete next[id]
      } else {
        next[id] = { qty: 1, rarity: 'base' }
      }
      save(next)
      return next
    })
  }, [])

  const setQty = useCallback((id, qty) => {
    setCollection(prev => {
      const next = { ...prev }
      if (qty <= 0) {
        delete next[id]
      } else {
        next[id] = { qty, rarity: next[id]?.rarity || 'base' }
      }
      save(next)
      return next
    })
  }, [])

  const setRarity = useCallback((id, rarity) => {
    setCollection(prev => {
      const current = prev[id]
      if (!current) return prev
      const next = { ...prev, [id]: { ...current, rarity } }
      save(next)
      return next
    })
  }, [])

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'panini-wc2026-collection.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [collection])

  const importJSON = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        save(data)
        setCollection(data)
      } catch {
        alert('Invalid file')
      }
    }
    reader.readAsText(file)
  }, [])

  const owned = Object.values(collection).filter(v => v.qty > 0).length
  const duplicates = Object.values(collection).reduce((sum, v) => sum + Math.max(0, v.qty - 1), 0)

  return { collection, get, toggle, setQty, setRarity, exportJSON, importJSON, owned, duplicates }
}
