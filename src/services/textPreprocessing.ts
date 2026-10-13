// ─────────────────────────────────────────────
// Text Preprocessing Service
// Stage 1 of the NLP pipeline
// All processing is local — no text is sent to remote servers
// ─────────────────────────────────────────────

/**
 * Normalize whitespace and punctuation while preserving
 * Sinhala Unicode characters, emojis, and meaningful repetition.
 */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Check if a string contains Sinhala Unicode characters (U+0D80–U+0DFF)
 */
export function hasSinhalaScript(text: string): boolean {
  return /[\u0D80-\u0DFF]/.test(text);
}

/**
 * Check if a string contains English (Latin) characters
 */
export function hasLatinScript(text: string): boolean {
  return /[a-zA-Z]/.test(text);
}

/**
 * Detect common Singlish patterns (Sinhala concepts written in Latin alphabet)
 */
export function hasSinglishPatterns(text: string): boolean {
  const singlishTerms = [
    'balla', 'pissu', 'maranawa', 'hora', 'gahamu', 'gahanne',
    'tharamu', 'boru', 'umbata', 'umba', 'gahanawa', 'maramu',
    'dakke', 'karamu', 'balanawa', 'kela', 'puka', 'den',
    'mokakda', 'koheda', 'api', 'eka', 'honda', 'nehe', 'athi',
  ];
  const lower = text.toLowerCase();
  return singlishTerms.some(term => lower.includes(term));
}

/**
 * Sanitize text for safe display (prevent XSS when rendering)
 * Returns HTML-escaped version of text
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Extract a safe, limited-length excerpt from text centered around a match index
 * Never strips content — only limits what is displayed
 */
export function extractExcerpt(text: string, matchIndex: number, radius = 60): string {
  const start = Math.max(0, matchIndex - radius);
  const end = Math.min(text.length, matchIndex + radius);
  let excerpt = text.slice(start, end);
  if (start > 0) excerpt = '…' + excerpt;
  if (end < text.length) excerpt = excerpt + '…';
  return excerpt;
}

/**
 * Count words in text (handles mixed scripts)
 */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Count characters (Unicode-aware)
 */
export function charCount(text: string): number {
  return [...text].length;
}

/**
 * Main preprocessing function — preserves original, returns normalized version
 */
export function preprocessText(originalText: string): {
  original: string;
  normalized: string;
  wordCount: number;
  charCount: number;
  hasSinhala: boolean;
  hasLatin: boolean;
  hasSinglish: boolean;
} {
  const normalized = normalizeWhitespace(originalText);
  return {
    original: originalText,
    normalized,
    wordCount: wordCount(normalized),
    charCount: charCount(normalized),
    hasSinhala: hasSinhalaScript(normalized),
    hasLatin: hasLatinScript(normalized),
    hasSinglish: hasSinglishPatterns(normalized),
  };
}
