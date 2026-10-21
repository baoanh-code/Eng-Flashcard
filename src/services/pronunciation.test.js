import { describe, expect, it, vi } from 'vitest'
import { pronounceEnglishTerm } from './pronunciation.js'

describe('pronounceEnglishTerm', () => {
  it('cancels current speech and speaks the English term with a preferred voice', () => {
    const cancel = vi.fn()
    const speak = vi.fn()
    const voices = [{ lang: 'vi-VN' }, { lang: 'en-US', name: 'English' }]
    const speech = { cancel, speak, getVoices: () => voices }
    class Utterance { constructor(text) { this.text = text } }

    expect(pronounceEnglishTerm('pottery', speech, Utterance)).toBe(true)
    expect(cancel).toHaveBeenCalledOnce()
    expect(speak).toHaveBeenCalledWith(expect.objectContaining({ text: 'pottery', lang: 'en-US', voice: voices[1] }))
  })

  it('fails safely when speech synthesis is unavailable', () => {
    expect(pronounceEnglishTerm('pottery', undefined, undefined)).toBe(false)
  })
})
