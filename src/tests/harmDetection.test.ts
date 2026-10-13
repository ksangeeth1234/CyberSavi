import { describe, it, expect } from 'vitest'
import { detectHarmIndicators } from '../services/harmDetection'

describe('detectHarmIndicators', () => {
  it('returns empty array for benign text', () => {
    const result = detectHarmIndicators('Hello, hope you are having a great day!')
    expect(result).toHaveLength(0)
  })

  it('detects direct threat in English', () => {
    const result = detectHarmIndicators('I will kill you if you do that again.')
    const threats = result.filter(i => i.category === 'threat')
    expect(threats.length).toBeGreaterThan(0)
    expect(threats[0].severity).toBe('high')
  })

  it('detects self-harm incitement', () => {
    const result = detectHarmIndicators('You should kill yourself, kys loser')
    const threats = result.filter(i => i.category === 'threat')
    expect(threats.length).toBeGreaterThan(0)
  })

  it('detects doxxing threat', () => {
    const result = detectHarmIndicators("I know where you live and I'll expose you")
    const doxxing = result.filter(i => i.category === 'doxxing')
    expect(doxxing.length).toBeGreaterThan(0)
  })

  it('detects Singlish threat', () => {
    const result = detectHarmIndicators('Maranawa umbata, balla kauda umba')
    const threats = result.filter(i => i.category === 'threat')
    const insults = result.filter(i => i.category === 'direct_insult')
    expect(threats.length + insults.length).toBeGreaterThan(0)
  })

  it('sorts by severity (high first)', () => {
    const result = detectHarmIndicators('I will kill you, stupid idiot loser')
    if (result.length > 1) {
      const severityOrder = { high: 0, medium: 1, low: 2 }
      for (let i = 0; i < result.length - 1; i++) {
        expect(severityOrder[result[i].severity]).toBeLessThanOrEqual(severityOrder[result[i + 1].severity])
      }
    }
  })

  it('detects sexual harassment indicator', () => {
    const result = detectHarmIndicators('Send me your nudes or I will post your photos')
    const sexual = result.filter(i => i.category === 'sexual_harassment' || i.category === 'doxxing')
    expect(sexual.length).toBeGreaterThan(0)
  })

  it('limits duplicates per category', () => {
    // Multiple same-category matches should be deduplicated to max 3
    const result = detectHarmIndicators('stupid stupid stupid idiot moron dumbass loser')
    const insults = result.filter(i => i.category === 'direct_insult')
    expect(insults.length).toBeLessThanOrEqual(3)
  })
})
