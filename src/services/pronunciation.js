export function pronounceEnglishTerm(term, speech = globalThis.speechSynthesis, Utterance = globalThis.SpeechSynthesisUtterance) {
  if (!term || !speech || typeof speech.speak !== 'function' || typeof Utterance !== 'function') return false

  speech.cancel?.()
  const utterance = new Utterance(term)
  const voices = typeof speech.getVoices === 'function' ? speech.getVoices() : []
  const englishVoice = voices.find((voice) => /^en-US\b/i.test(voice.lang))
    ?? voices.find((voice) => /^en\b/i.test(voice.lang))
  utterance.lang = englishVoice?.lang || 'en-US'
  if (englishVoice) utterance.voice = englishVoice
  speech.speak(utterance)
  return true
}
