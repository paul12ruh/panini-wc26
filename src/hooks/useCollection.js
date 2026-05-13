import { useState, useCallback } from 'react'
import { ALL_STICKERS } from '../data/stickers'

const STORAGE_KEY = 'panini-wc2026'
const STORAGE_META_KEY = `${STORAGE_KEY}:meta`
const VALID_RARITIES = new Set(['base', 'blue', 'red', 'purple', 'green', 'black'])
const STICKER_IDS = ALL_STICKERS.map(sticker => sticker.id)
const STICKER_ID_SET = new Set(STICKER_IDS)

export const normalizeCollection = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}

  return Object.entries(raw).reduce((next, [id, value]) => {
    if (!STICKER_ID_SET.has(id)) return next

    const entry = value && typeof value === 'object' ? value : { qty: value }
    const qty = Math.min(999, Math.floor(Number(entry.qty)))
    if (!Number.isFinite(qty) || qty <= 0) return next

    const rarity = VALID_RARITIES.has(entry.rarity) ? entry.rarity : 'base'
    next[id] = { qty, rarity }
    return next
  }, {})
}

const load = () => {
  try {
    return normalizeCollection(JSON.parse(localStorage.getItem(STORAGE_KEY)))
  } catch {
    return {}
  }
}

const loadMeta = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_META_KEY)) || {}
  } catch {
    return {}
  }
}

const save = (data, updatedAt = new Date().toISOString()) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  localStorage.setItem(STORAGE_META_KEY, JSON.stringify({ updatedAt }))
  return updatedAt
}

// collection shape: { [stickerId]: { qty: number, rarity: 'base' | 'blue' | 'green' } }
// a sticker is "owned" when qty >= 1

export function useCollection() {
  const [collection, setCollection] = useState(load)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => loadMeta().updatedAt || null)

  const get = useCallback((id) => collection[id] || { qty: 0, rarity: 'base' }, [collection])

  const toggle = useCallback((id) => {
    if (!STICKER_ID_SET.has(id)) return
    setCollection(prev => {
      const next = { ...prev }
      if (next[id]?.qty > 0) {
        delete next[id]
      } else {
        next[id] = { qty: 1, rarity: 'base' }
      }
      setLastUpdatedAt(save(next))
      return next
    })
  }, [])

  const setQty = useCallback((id, qty) => {
    if (!STICKER_ID_SET.has(id)) return
    setCollection(prev => {
      const next = { ...prev }
      const normalizedQty = Math.min(999, Math.floor(Number(qty)))
      if (!Number.isFinite(normalizedQty) || normalizedQty <= 0) {
        delete next[id]
      } else {
        next[id] = { qty: normalizedQty, rarity: next[id]?.rarity || 'base' }
      }
      setLastUpdatedAt(save(next))
      return next
    })
  }, [])

  const setRarity = useCallback((id, rarity) => {
    if (!STICKER_ID_SET.has(id) || !VALID_RARITIES.has(rarity)) return
    setCollection(prev => {
      const current = prev[id]
      if (!current) return prev
      const next = { ...prev, [id]: { ...current, rarity } }
      setLastUpdatedAt(save(next))
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
        const data = normalizeCollection(JSON.parse(e.target.result))
        setLastUpdatedAt(save(data))
        setCollection(data)
      } catch {
        alert('Invalid file')
      }
    }
    reader.readAsText(file)
  }, [])

  const loadCollection = useCallback((data, updatedAt) => {
    const normalized = normalizeCollection(data)
    setLastUpdatedAt(save(normalized, updatedAt))
    setCollection(normalized)
  }, [])

  const owned = STICKER_IDS.filter(id => collection[id]?.qty > 0).length
  const duplicates = STICKER_IDS.reduce((sum, id) => sum + Math.max(0, (collection[id]?.qty || 0) - 1), 0)

  return { collection, get, toggle, setQty, setRarity, exportJSON, importJSON, owned, duplicates, loadCollection, lastUpdatedAt }
}
