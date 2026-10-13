// ─────────────────────────────────────────────
// Language Detection Service
// Stage 2 of the NLP pipeline — client-side only
// ─────────────────────────────────────────────

import type { DetectedLanguage, LanguageAnalysis } from '../types';
import { hasSinhalaScript, hasLatinScript, hasSinglishPatterns } from './textPreprocessing';

/**
 * Calculate proportion of Sinhala Unicode characters in text
 */
function sinhalaScriptRatio(text: string): number {
  const chars = [...text];
  const sinhalaChars = chars.filter(c => /[\u0D80-\u0DFF]/.test(c));
  return chars.length > 0 ? sinhalaChars.length / chars.length : 0;
}

/**
 * Calculate proportion of Latin characters in text
 */
function latinScriptRatio(text: string): number {
  const chars = [...text].filter(c => /[^\s\d\p{P}]/u.test(c));
  const latinChars = chars.filter(c => /[a-zA-Z]/.test(c));
  return chars.length > 0 ? latinChars.length / chars.length : 0;
}

/**
 * Main language detection — returns structured analysis
 * Uses heuristics: script ratios + known vocabulary
 */
export function detectLanguage(text: string, userHint?: DetectedLanguage | 'auto'): LanguageAnalysis {
  const hasSinhala = hasSinhalaScript(text);
  const hasLatin = hasLatinScript(text);
  const hasSinglish = hasSinglishPatterns(text);

  const siRatio = sinhalaScriptRatio(text);
  const latRatio = latinScriptRatio(text);

  const scripts: string[] = [];
  if (hasSinhala) scripts.push('Sinhala Unicode');
  if (hasLatin) scripts.push('Latin (English/Singlish)');

  let detected: DetectedLanguage = 'unknown';
  let confidence: 'low' | 'medium' | 'high' = 'low';
  let mixDetails = '';

  // If user specified a language (not auto-detect), use that with lower confidence
  if (userHint && userHint !== 'auto') {
    detected = userHint;
    confidence = 'medium';
    mixDetails = `Language manually set to ${userHint}. Automatic detection also ran.`;
  }

  if (siRatio > 0.6) {
    detected = 'sinhala';
    confidence = 'high';
    mixDetails = `${Math.round(siRatio * 100)}% Sinhala script characters detected.`;
  } else if (siRatio > 0.15 && latRatio > 0.15) {
    detected = 'mixed';
    confidence = 'medium';
    mixDetails = `Approximately ${Math.round(siRatio * 100)}% Sinhala Unicode and ${Math.round(latRatio * 100)}% Latin characters detected.`;
  } else if (hasSinglish && latRatio > 0.3) {
    detected = 'singlish';
    confidence = 'medium';
    mixDetails = 'Singlish vocabulary patterns detected in Latin script text.';
  } else if (latRatio > 0.5 && !hasSinglish) {
    detected = 'english';
    confidence = siRatio < 0.05 ? 'high' : 'medium';
    mixDetails = siRatio < 0.05
      ? 'Predominantly Latin script with no significant Sinhala Unicode.'
      : 'Predominantly Latin script with some Sinhala-script characters.';
  } else if (latRatio > 0.3 && hasSinglish) {
    detected = 'singlish';
    confidence = 'medium';
    mixDetails = 'Mixed Latin script with Singlish vocabulary patterns.';
  } else if (hasSinhala || hasSinglish) {
    detected = 'mixed';
    confidence = 'low';
    mixDetails = 'Script analysis inconclusive — text may be multilingual.';
  }

  // Override with user hint if set
  if (userHint && userHint !== 'auto' && detected !== userHint) {
    detected = userHint;
    confidence = 'low';
    mixDetails += ` Note: Automatic detection suggested "${detected}".`;
  }

  return {
    detected,
    confidence,
    scripts,
    hasSinhalaUnicode: hasSinhala,
    hasSinglishPatterns: hasSinglish,
    hasEnglish: hasLatin,
    mixDetails,
  };
}

export function languageDisplayLabel(lang: DetectedLanguage): string {
  const labels: Record<DetectedLanguage, string> = {
    sinhala: 'Sinhala (Unicode Script)',
    singlish: 'Singlish (Sinhala in Latin Characters)',
    english: 'English',
    mixed: 'Mixed / Multilingual',
    unknown: 'Unknown / Insufficient Text',
  };
  return labels[lang];
}
