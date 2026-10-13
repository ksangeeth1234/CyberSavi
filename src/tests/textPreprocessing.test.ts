import { describe, it, expect } from 'vitest'
import {
  normalizeWhitespace,
  hasSinhalaScript,
  hasLatinScript,
  hasSinglishPatterns,
  wordCount,
  charCount,
  extractExcerpt,
  preprocessText,
} from '../services/textPreprocessing'

describe('normalizeWhitespace', () => {
  it('collapses multiple spaces', () => {
    expect(normalizeWhitespace('hello   world')).toBe('hello world')
  })
  it('normalizes CRLF to LF', () => {
    expect(normalizeWhitespace('line1\r\nline2')).toBe('line1\nline2')
  })
  it('collapses more than 2 blank lines', () => {
    expect(normalizeWhitespace('a\n\n\n\nb')).toBe('a\n\nb')
  })
  it('trims leading and trailing whitespace', () => {
    expect(normalizeWhitespace('  hello  ')).toBe('hello')
  })
})

describe('hasSinhalaScript', () => {
  it('detects Sinhala Unicode characters', () => {
    expect(hasSinhalaScript('ආයුබෝවන්')).toBe(true)
  })
  it('returns false for plain English text', () => {
    expect(hasSinhalaScript('hello world')).toBe(false)
  })
  it('detects mixed text with Sinhala', () => {
    expect(hasSinhalaScript('hello ආයුබෝ')).toBe(true)
  })
})

describe('hasLatinScript', () => {
  it('detects Latin characters', () => {
    expect(hasLatinScript('hello')).toBe(true)
  })
  it('returns false for pure Sinhala', () => {
    expect(hasLatinScript('ආයුබෝවන්')).toBe(false)
  })
})

describe('hasSinglishPatterns', () => {
  it('detects singlish terms', () => {
    expect(hasSinglishPatterns('balla, pissu wena epa')).toBe(true)
  })
  it('returns false for plain English', () => {
    expect(hasSinglishPatterns('hello, how are you?')).toBe(false)
  })
})

describe('wordCount', () => {
  it('counts words correctly', () => {
    expect(wordCount('hello world foo')).toBe(3)
  })
  it('handles extra whitespace', () => {
    expect(wordCount('  hello   world  ')).toBe(2)
  })
  it('handles empty string', () => {
    expect(wordCount('')).toBe(0)
  })
})

describe('charCount', () => {
  it('counts ASCII characters', () => {
    expect(charCount('hello')).toBe(5)
  })
  it('counts Sinhala Unicode characters correctly', () => {
    const text = 'ආයු' // 3 Sinhala chars
    expect(charCount(text)).toBe(3)
  })
})

describe('extractExcerpt', () => {
  it('extracts centered excerpt', () => {
    const text = 'a'.repeat(200)
    const excerpt = extractExcerpt(text, 100, 20)
    expect(excerpt).toContain('…')
    expect(excerpt.replace(/…/g, '').length).toBeLessThanOrEqual(41)
  })
  it('handles start of text without leading ellipsis', () => {
    const text = 'hello world foo bar'
    const excerpt = extractExcerpt(text, 0, 30)
    expect(excerpt.startsWith('…')).toBe(false)
  })
})

describe('preprocessText', () => {
  it('returns structured result', () => {
    const result = preprocessText('Hello world balla')
    expect(result.original).toBe('Hello world balla')
    expect(result.wordCount).toBe(3)
    expect(result.hasSinglish).toBe(true)
    expect(result.hasLatin).toBe(true)
    expect(result.hasSinhala).toBe(false)
  })
})
