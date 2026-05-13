import { useEffect, useRef, useState } from 'react'
import { ALL_STICKERS } from '../data/stickers'

// Build a flat lookup: stickerId -> sticker object
const STICKER_MAP = Object.fromEntries(ALL_STICKERS.map(s => [s.id, s]))

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

function parseTranscript(raw) {
  const text = raw.toLowerCase().trim()

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

  if (number === null) return null

  // --- extract team code ---
  let teamCode = null
  for (const key of TEAM_KEYS_SORTED) {
    if (text.includes(key)) {
      teamCode = TEAM_NAME_MAP[key]
      break
    }
  }

  if (!teamCode) return null

  return { teamCode, number }
}

export default function VoiceInput({ collection, onMark }) {
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
        showToast("Didn't catch that — try saying 'France 7'")
        return
      }

      const { teamCode, number } = parsed
      const stickerId = `${teamCode}-${number}`
      const sticker = STICKER_MAP[stickerId]

      if (!sticker) {
        showToast("Didn't catch that — try saying 'France 7'")
        return
      }

      const isOwned = collection[stickerId]?.qty > 0

      if (isOwned) {
        showToast(`${stickerId} already marked`)
      } else {
        onMark(stickerId)
        showToast(`Marked ${stickerId} — ${sticker.name} ✓`, stickerId)
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
        aria-label={listening ? 'Stop listening' : 'Voice input — say team and number'}
        title={listening ? 'Listening… click to stop' : "Say e.g. 'France 7'"}
      >
        {listening ? '⏹' : '🎤'}
      </button>

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
