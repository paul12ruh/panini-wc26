import { ALL_STICKERS } from '../data/stickers'

export const calculateCollectionStats = (collection) => {
  const owned = ALL_STICKERS.filter(sticker => collection[sticker.id]?.qty > 0).length
  const duplicates = ALL_STICKERS.reduce(
    (sum, sticker) => sum + Math.max(0, (collection[sticker.id]?.qty || 0) - 1),
    0
  )

  return { owned, duplicates }
}
