import { useEffect, useRef, useState } from 'react'
import { ALL_STICKERS, TEAMS } from '../data/stickers'

// Build a flat lookup: stickerId -> sticker object
const STICKER_MAP = Object.fromEntries(ALL_STICKERS.map(s => [s.id, s]))
const TEAM_BY_CODE = Object.fromEntries(TEAMS.map(team => [team.code, team]))

const RARITIES = new Set(['base', 'blue', 'red', 'purple', 'green', 'black'])
const RARITY_LABELS = {
  base: 'Base',
  blue: 'Blue',
  red: 'Red',
  purple: 'Purple',
  green: 'Green',
  black: 'Black',
}
const RARITY_ALIASES = {
  normal: 'base',
  regular: 'base',
  standard: 'base',
}

// Spoken word numbers -> integer
const WORD_NUMBERS = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
}

// Spoken team name variants -> team code
const TEAM_NAME_MAP = {
  // ALG
  algeria: 'ALG', alg: 'ALG',
  // ARG
  argentina: 'ARG', arg: 'ARG',
  // AUS
  australia: 'AUS', aus: 'AUS',
  // AUT
  austria: 'AUT', aut: 'AUT',
  // BEL
  belgium: 'BEL', bel: 'BEL',
  // BIH
  bosnia: 'BIH', 'bosnia and herzegovina': 'BIH', 'bosnia herzegovina': 'BIH', bih: 'BIH',
  // BRA
  brazil: 'BRA', bra: 'BRA',
  // CAN
  canada: 'CAN', can: 'CAN',
  // CPV
  'cape verde': 'CPV', cpv: 'CPV',
  // CIV
  'ivory coast': 'CIV', 'cote divoire': 'CIV', "cote d'ivoire": 'CIV', civ: 'CIV',
  // COD
  congo: 'COD', 'dr congo': 'COD', 'democratic republic of congo': 'COD', cod: 'COD',
  // COL
  colombia: 'COL', col: 'COL',
  // CRO
  croatia: 'CRO', cro: 'CRO',
  // CUW
  curacao: 'CUW', curaçao: 'CUW', cuw: 'CUW',
  // CZE
  czech: 'CZE', 'czech republic': 'CZE', czechia: 'CZE', cze: 'CZE',
  // ECU
  ecuador: 'ECU', ecu: 'ECU',
  // EGY
  egypt: 'EGY', egy: 'EGY',
  // ENG
  england: 'ENG', eng: 'ENG',
  // ESP
  spain: 'ESP', esp: 'ESP',
  // FRA
  france: 'FRA', fra: 'FRA',
  // GER
  germany: 'GER', ger: 'GER',
  // GHA
  ghana: 'GHA', gha: 'GHA',
  // HAI
  haiti: 'HAI', hai: 'HAI',
  // IRN
  iran: 'IRN', irn: 'IRN',
  // IRQ
  iraq: 'IRQ', irq: 'IRQ',
  // JOR
  jordan: 'JOR', jor: 'JOR',
  // JPN
  japan: 'JPN', jpn: 'JPN',
  // KOR
  korea: 'KOR', 'south korea': 'KOR', kor: 'KOR',
  // KSA
  saudi: 'KSA', 'saudi arabia': 'KSA', ksa: 'KSA',
  // MAR
  morocco: 'MAR', mar: 'MAR',
  // MEX
  mexico: 'MEX', mex: 'MEX',
  // NED
  netherlands: 'NED', holland: 'NED', ned: 'NED',
  // NOR
  norway: 'NOR', nor: 'NOR',
  // NZL
  'new zealand': 'NZL', nzl: 'NZL',
  // PAN
  panama: 'PAN', pan: 'PAN',
  // PAR
  paraguay: 'PAR', par: 'PAR',
  // POR
  portugal: 'POR', por: 'POR',
  // QAT
  qatar: 'QAT', qat: 'QAT',
  // RSA
  'south africa': 'RSA', rsa: 'RSA',
  // SCO
  scotland: 'SCO', sco: 'SCO',
  // SEN
  senegal: 'SEN', sen: 'SEN',
  // SUI
  switzerland: 'SUI', swiss: 'SUI', sui: 'SUI',
  // SWE
  sweden: 'SWE', swe: 'SWE',
  // TUN
  tunisia: 'TUN', tun: 'TUN',
  // TUR
  turkey: 'TUR', turkiye: 'TUR', türkiye: 'TUR', tur: 'TUR',
  // URU
  uruguay: 'URU', uru: 'URU',
  // USA
  usa: 'USA', 'united states': 'USA', america: 'USA', us: 'USA',
  // UZB
  uzbekistan: 'UZB', uzb: 'UZB',
}

// Sort multi-word keys longest-first so greedy matching works correctly
const TEAM_KEYS_SORTED = Object.keys(TEAM_NAME_MAP).sort((a, b) => b.length - a.length)

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const TEAM_KEY_MATCHERS = TEAM_KEYS_SORTED.map(key => [
  key,
  new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(key).replace(/\s+/g, '\\s+')}(?=$|[^\\p{L}\\p{N}])`, 'u'),
])

const normalizeForVoice = value => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ')

const getStickerTeamCode = sticker => {
  const match = sticker.id.match(/^([A-Z]{3})-\d+$/)
  return match ? match[1] : null
}

const addAlias = (aliases, alias, stickerId) => {
  const normalized = normalizeForVoice(alias)
  if (!normalized) return
  aliases.set(normalized, [...(aliases.get(normalized) || []), stickerId])
}

const buildStickerNameAliases = () => {
  const aliases = new Map()
  const potentialShortAliases = new Map()

  for (const sticker of ALL_STICKERS) {
    addAlias(aliases, sticker.name, sticker.id)

    const teamCode = getStickerTeamCode(sticker)
    const team = teamCode ? TEAM_BY_CODE[teamCode] : null
    if (team) {
      addAlias(aliases, `${team.name} ${sticker.name}`, sticker.id)
      addAlias(aliases, `${sticker.name} ${team.name}`, sticker.id)
      addAlias(aliases, `${team.code} ${sticker.name}`, sticker.id)
      addAlias(aliases, `${sticker.name} ${team.code}`, sticker.id)
    }

    const words = normalizeForVoice(sticker.name).split(' ').filter(Boolean)
    if (words.length > 1 && sticker.name !== 'Team Badge' && sticker.name !== 'Team Photo') {
      const lastWord = words[words.length - 1]
      potentialShortAliases.set(lastWord, [...(potentialShortAliases.get(lastWord) || []), sticker.id])
    }
  }

  for (const [alias, stickerIds] of potentialShortAliases) {
    if (stickerIds.length === 1) aliases.set(alias, stickerIds)
  }

  return [...aliases.entries()]
    .filter(([, stickerIds]) => stickerIds.length === 1)
    .map(([alias, [stickerId]]) => [alias, stickerId])
    .sort((a, b) => b[0].length - a[0].length)
}

const STICKER_NAME_ALIASES = buildStickerNameAliases()

const hasPhrase = (text, phrase) => {
  const matcher = new RegExp(`(^|\\s)${escapeRegExp(phrase).replace(/\s+/g, '\\s+')}(?=$|\\s)`)
  return matcher.test(text)
}

function parseRarity(text) {
  for (const word of text.split(/\s+/)) {
    if (RARITIES.has(word)) return word
    if (RARITY_ALIASES[word]) return RARITY_ALIASES[word]
  }
  return 'base'
}

function findStickerByName(normalizedText) {
  for (const [alias, stickerId] of STICKER_NAME_ALIASES) {
    if (hasPhrase(normalizedText, alias)) return STICKER_MAP[stickerId]
  }
  return null
}

function parseTranscript(raw) {
  const text = raw.toLowerCase().trim()
  const normalizedText = normalizeForVoice(raw)
  const rarity = parseRarity(normalizedText)

  // --- extract number ---
  let number = null

  // Try word numbers first (scan all words in the transcript)
  for (const [word, val] of Object.entries(WORD_NUMBERS)) {
    // match whole word
    const re = new RegExp(`\\b${word}\\b`)
    if (re.test(text)) {
      number = val
      break
    }
  }

  // Try digit(s) 1–20
  if (number === null) {
    const digitMatch = text.match(/\b(20|1[0-9]|[1-9])\b/)
    if (digitMatch) number = parseInt(digitMatch[1], 10)
  }

  // --- extract team code ---
  let teamCode = null
  for (const [key, matcher] of TEAM_KEY_MATCHERS) {
    if (matcher.test(text)) {
      teamCode = TEAM_NAME_MAP[key]
      break
    }
  }

  if (number !== null && teamCode) return { stickerId: `${teamCode}-${number}`, rarity }

  const sticker = findStickerByName(normalizedText)
  if (sticker) return { stickerId: sticker.id, rarity }

  return null
}

export default function VoiceInput({ collection, onMark, onSetRarity }) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [toast, setToast] = useState(null) // { message, stickerId } | null
  const recognitionRef = useRef(null)
  const toastTimerRef = useRef(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) setSupported(true)
  }, [])

  const dismissToast = () => {
    clearTimeout(toastTimerRef.current)
    setToast(null)
  }

  const showToast = (message, stickerId = null) => {
    clearTimeout(toastTimerRef.current)
    setToast({ message, stickerId })
    toastTimerRef.current = setTimeout(() => setToast(null), 3000)
  }

  const showTryAgainToast = () => {
    showToast("Didn't catch that — try 'France 7', 'Messi', or 'blue Mbappe'")
  }

  const handleMicClick = () => {
    if (listening) {
      // Stop early if already listening
      if (recognitionRef.current) recognitionRef.current.stop()
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      const parsed = parseTranscript(transcript)

      if (!parsed) {
        showTryAgainToast()
        return
      }

      const { stickerId, rarity } = parsed
      const sticker = STICKER_MAP[stickerId]

      if (!sticker) {
        showTryAgainToast()
        return
      }

      const isOwned = collection[stickerId]?.qty > 0
      const rarityLabel = RARITY_LABELS[rarity]

      if (isOwned) {
        if (onSetRarity) {
          onSetRarity(stickerId, rarity)
          showToast(`Added ${rarityLabel} ${stickerId}`)
        } else {
          showToast(`${stickerId} already marked`)
        }
      } else {
        if (rarity === 'base' || !onSetRarity) {
          onMark(stickerId)
        } else {
          onSetRarity(stickerId, rarity)
        }
        const rarityText = rarity === 'base' ? '' : ` ${rarityLabel}`
        showToast(`Marked${rarityText} ${stickerId} — ${sticker.name} ✓`, stickerId)
      }
    }

    recognition.onerror = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognition.start()
  }

  const handleUndo = () => {
    if (toast?.stickerId) {
      onMark(toast.stickerId) // toggle off
    }
    dismissToast()
  }

  if (!supported) return null

  return (
    <>
      <button
        className={`voice-fab${listening ? ' listening' : ''}`}
        onClick={handleMicClick}
        aria-label={listening ? 'Stop listening' : 'Voice input — say a team and number, sticker name, player name, or color'}
        title={listening ? 'Listening… click to stop' : "Say 'France 7', 'Messi', or 'blue Mbappe'"}
      >
        {listening ? '⏹' : '🎤'}
      </button>

      <div className="voice-help" aria-label="Voice input examples">
        Say <strong>France 7</strong>, <strong>Messi</strong>, or <strong>blue Mbappe</strong>
      </div>

      {toast && (
        <div className="voice-toast" role="status">
          <span className="voice-toast-msg">{toast.message}</span>
          {toast.stickerId && (
            <button className="undo-btn" onClick={handleUndo}>
              Undo
            </button>
          )}
        </div>
      )}
    </>
  )
}
