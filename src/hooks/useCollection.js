import { useState, useCallback } from 'react'
import { ALL_STICKERS } from '../data/stickers'
import { calculateCollectionStats } from '../lib/collectionStats'

const STORAGE_KEY = 'panini-wc2026'
const STORAGE_META_KEY = `${STORAGE_KEY}:meta`
const ACTIVITY_KEY = `${STORAGE_KEY}:activity`
const RARITY_ORDER = ['base', 'blue', 'red', 'purple', 'green', 'black']
const VALID_RARITIES = new Set(RARITY_ORDER)
const STICKER_IDS = ALL_STICKERS.map(sticker => sticker.id)
const STICKER_ID_SET = new Set(STICKER_IDS)

const cleanQty = (qty) => {
  const normalized = Math.min(999, Math.floor(Number(qty)))
  return Number.isFinite(normalized) && normalized > 0 ? normalized : 0
}

const emptyVariants = () => Object.fromEntries(RARITY_ORDER.map(rarity => [rarity, 0]))

const highestRarity = (variants) => {
  for (let i = RARITY_ORDER.length - 1; i >= 0; i -= 1) {
    const rarity = RARITY_ORDER[i]
    if ((variants[rarity] || 0) > 0) return rarity
  }
  return 'base'
}

const makeEntry = (variants) => {
  const normalizedVariants = emptyVariants()
  RARITY_ORDER.forEach(rarity => {
    normalizedVariants[rarity] = cleanQty(variants?.[rarity])
  })

  const qty = RARITY_ORDER.reduce((sum, rarity) => sum + normalizedVariants[rarity], 0)
  if (qty <= 0) return null

  return {
    qty,
    rarity: highestRarity(normalizedVariants),
    variants: normalizedVariants,
  }
}

export const normalizeCollection = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}

  return Object.entries(raw).reduce((next, [id, value]) => {
    if (!STICKER_ID_SET.has(id)) return next

    const entry = value && typeof value === 'object' ? value : { qty: value }
    const variants = emptyVariants()

    if (entry.variants && typeof entry.variants === 'object' && !Array.isArray(entry.variants)) {
      RARITY_ORDER.forEach(rarity => {
        variants[rarity] = cleanQty(entry.variants[rarity])
      })

      const variantQty = RARITY_ORDER.reduce((sum, rarity) => sum + variants[rarity], 0)
      const declaredQty = cleanQty(entry.qty)
      if (declaredQty > variantQty) variants.base += declaredQty - variantQty
    } else {
      const qty = cleanQty(entry.qty)
      if (qty <= 0) return next
      const rarity = VALID_RARITIES.has(entry.rarity) ? entry.rarity : 'base'
      variants[rarity] = qty
    }

    const normalized = makeEntry(variants)
    if (normalized) next[id] = normalized
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

const loadActivity = () => {
  try {
    const activity = JSON.parse(localStorage.getItem(ACTIVITY_KEY))
    return Array.isArray(activity) ? activity.slice(0, 30) : []
  } catch {
    return []
  }
}

const save = (data, updatedAt = new Date().toISOString()) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  localStorage.setItem(STORAGE_META_KEY, JSON.stringify({ updatedAt }))
  return updatedAt
}

const saveActivity = (activity) => {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity.slice(0, 30)))
}

const createActivityId = () => (
  crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
)

// collection shape: { [stickerId]: { qty: number, rarity: highest owned color, variants: { [rarity]: number } } }
// a sticker is "owned" when qty >= 1

export function useCollection() {
  const [collection, setCollection] = useState(load)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => loadMeta().updatedAt || null)
  const [activity, setActivity] = useState(loadActivity)

  const get = useCallback((id) => collection[id] || { qty: 0, rarity: 'base', variants: emptyVariants() }, [collection])

  const toggle = useCallback((id) => {
    if (!STICKER_ID_SET.has(id)) return
    setCollection(prev => {
      const next = { ...prev }
      if (next[id]?.qty > 0) {
        delete next[id]
      } else {
        next[id] = makeEntry({ base: 1 })
      }
      setLastUpdatedAt(save(next))
      const item = {
        id: createActivityId(),
        stickerId: id,
        action: next[id] ? 'Marked base sticker' : 'Unmarked sticker',
        before: prev[id] || null,
        after: next[id] || null,
        createdAt: new Date().toISOString(),
      }
      setActivity(prevActivity => {
        const updated = [item, ...prevActivity].slice(0, 30)
        saveActivity(updated)
        return updated
      })
      return next
    })
  }, [])

  const setQty = useCallback((id, qty) => {
    if (!STICKER_ID_SET.has(id)) return
    setCollection(prev => {
      const next = { ...prev }
      const normalizedQty = cleanQty(qty)
      if (normalizedQty <= 0) {
        delete next[id]
      } else {
        const variants = { ...emptyVariants(), ...(next[id]?.variants || {}) }
        let delta = normalizedQty - (next[id]?.qty || 0)

        if (delta > 0) {
          variants.base += delta
        } else if (delta < 0) {
          delta = Math.abs(delta)
          for (const rarity of RARITY_ORDER) {
            const remove = Math.min(variants[rarity] || 0, delta)
            variants[rarity] -= remove
            delta -= remove
            if (delta === 0) break
          }
        }

        const entry = makeEntry(variants)
        if (entry) next[id] = entry
      }
      setLastUpdatedAt(save(next))
      const item = {
        id: createActivityId(),
        stickerId: id,
        action: `Set total quantity to ${normalizedQty}`,
        before: prev[id] || null,
        after: next[id] || null,
        createdAt: new Date().toISOString(),
      }
      setActivity(prevActivity => {
        const updated = [item, ...prevActivity].slice(0, 30)
        saveActivity(updated)
        return updated
      })
      return next
    })
  }, [])

  const setRarity = useCallback((id, rarity) => {
    if (!STICKER_ID_SET.has(id) || !VALID_RARITIES.has(rarity)) return
    setCollection(prev => {
      const variants = { ...emptyVariants(), ...(prev[id]?.variants || {}) }
      variants[rarity] += 1
      const entry = makeEntry(variants)
      if (!entry) return prev
      const next = { ...prev, [id]: entry }
      setLastUpdatedAt(save(next))
      const item = {
        id: createActivityId(),
        stickerId: id,
        action: `Added ${rarity} variant`,
        before: prev[id] || null,
        after: next[id],
        createdAt: new Date().toISOString(),
      }
      setActivity(prevActivity => {
        const updated = [item, ...prevActivity].slice(0, 30)
        saveActivity(updated)
        return updated
      })
      return next
    })
  }, [])

  const setVariantQty = useCallback((id, rarity, qty) => {
    if (!STICKER_ID_SET.has(id) || !VALID_RARITIES.has(rarity)) return
    setCollection(prev => {
      const variants = { ...emptyVariants(), ...(prev[id]?.variants || {}) }
      variants[rarity] = cleanQty(qty)
      const next = { ...prev }
      const entry = makeEntry(variants)
      if (entry) {
        next[id] = entry
      } else {
        delete next[id]
      }
      setLastUpdatedAt(save(next))
      const item = {
        id: createActivityId(),
        stickerId: id,
        action: `Set ${rarity} quantity to ${cleanQty(qty)}`,
        before: prev[id] || null,
        after: next[id] || null,
        createdAt: new Date().toISOString(),
      }
      setActivity(prevActivity => {
        const updated = [item, ...prevActivity].slice(0, 30)
        saveActivity(updated)
        return updated
      })
      return next
    })
  }, [])

  const undoLastActivity = useCallback(() => {
    setActivity(prevActivity => {
      const [last, ...rest] = prevActivity
      if (!last) return prevActivity

      setCollection(prev => {
        const next = { ...prev }
        if (last.before) {
          next[last.stickerId] = last.before
        } else {
          delete next[last.stickerId]
        }
        setLastUpdatedAt(save(next))
        return next
      })

      saveActivity(rest)
      return rest
    })
  }, [])

  const resetCollection = useCallback(() => {
    setCollection({})
    const updatedAt = save({})
    setLastUpdatedAt(updatedAt)
    saveActivity([])
    setActivity([])
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

  const { owned, duplicates } = calculateCollectionStats(collection)

  return {
    collection,
    get,
    toggle,
    setQty,
    setRarity,
    setVariantQty,
    exportJSON,
    importJSON,
    owned,
    duplicates,
    loadCollection,
    lastUpdatedAt,
    activity,
    undoLastActivity,
    resetCollection,
  }
}
