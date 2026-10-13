import { describe, it, expect } from 'vitest'
import { detectLanguage } from '../services/languageDetection'

describe('detectLanguage', () => {
  it('detects English text', () => {
    const result = detectLanguage('Hello, how are you doing today? This is an English sentence.')
    expect(result.detected).toBe('english')
    expect(result.hasEnglish).toBe(true)
    expect(result.hasSinhalaUnicode).toBe(false)
  })

  it('detects Singlish patterns', () => {
    const result = detectLanguage('balla kauda umba, pissu wena epa maranawa')
    expect(result.detected).toBe('singlish')
    expect(result.hasSinglishPatterns).toBe(true)
  })

  it('detects Sinhala Unicode', () => {
    const result = detectLanguage('ආයුබෝවන් මට ඔයාව ප්‍රේම් කරනවා')
    expect(result.hasSinhalaUnicode).toBe(true)
    expect(result.detected).toBe('sinhala')
  })

  it('respects user language hint', () => {
    const result = detectLanguage('hello world', 'singlish')
    expect(result.detected).toBe('singlish')
  })

  it('handles very short text', () => {
    const result = detectLanguage('ok')
    expect(['english', 'unknown']).toContain(result.detected)
  })

  it('detects mixed language', () => {
    const result = detectLanguage('Hello ආයුබෝ balla world')
    expect(['mixed', 'singlish', 'english']).toContain(result.detected)
  })
})
