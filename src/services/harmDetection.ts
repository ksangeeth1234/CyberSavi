// ─────────────────────────────────────────────
// Harm Detection Service
// Stage 3 of the NLP pipeline — client-side only
// Uses rule-based lexicon matching with transparent indicators
// ─────────────────────────────────────────────

import type { DetectedIndicator } from '../types';
import { ALL_LEXICONS } from '../data/lexicons';
import { extractExcerpt } from './textPreprocessing';

const ALTERNATIVE_INTERPRETATIONS: Record<string, string[]> = {
  direct_insult: [
    'This language may be friendly banter between close friends.',
    'The phrase could be a common expression in the cultural context.',
    'The speaker may have been quoting or reporting someone else\'s words.',
  ],
  degrading: [
    'This could be hyperbolic expression common in informal online communication.',
    'The statement may be self-deprecating humour.',
    'Context not visible in this message may change the meaning significantly.',
  ],
  threat: [
    'Threat language is sometimes used figuratively in casual speech.',
    'This phrase may be part of a game, movie quote, or roleplay context.',
    'The full conversation context, which is not available, may clarify intent.',
  ],
  coercive: [
    'Assertive language is not always coercive — context matters.',
    'This may be a firm request rather than a threat.',
  ],
  sexual_harassment: [
    'Relationships between adults may involve consensual explicit communication.',
    'The full conversation context is not available and may change the interpretation.',
  ],
  discriminatory: [
    'Reclaimed language is used by some community members.',
    'This may be educational, journalistic, or critical discussion.',
    'Context not visible here may change the meaning.',
  ],
  doxxing: [
    'The speaker may know the person personally and this could be innocent.',
    'This may be a rhetorical statement rather than a genuine threat.',
  ],
  repeated_contact: [
    'Multiple messages may be normal in an ongoing conversation.',
    'This assessment is based only on the messages provided.',
  ],
  identity_attack: [
    'Terms of identity may be used differently within a community.',
    'The full conversation context is not visible.',
  ],
};

const WHY_IT_MATTERS: Record<string, string> = {
  direct_insult: 'Personal attacks can cause significant psychological harm and are often associated with cyberbullying.',
  degrading: 'Language designed to humiliate or devalue a person contributes to a hostile online environment.',
  threat: 'Statements expressing intent to cause harm may indicate genuine danger and may be legally relevant.',
  coercive: 'Language that pressures or forces someone into actions can be a component of harassment or abuse.',
  sexual_harassment: 'Unwanted sexual language or requests can cause serious distress and may be illegal.',
  discriminatory: 'Targeting someone based on identity characteristics can constitute hate speech.',
  doxxing: 'Threatening to expose private information is a serious violation of privacy and personal safety.',
  repeated_contact: 'Repeated unwanted contact is a key indicator of harassment and cyberstalking.',
  identity_attack: 'Attacks on personal identity cause profound harm and may signal targeted harassment.',
};

/**
 * Run all lexicon patterns against the normalized text
 * Returns deduplicated indicators with excerpts and explanations
 */
export function detectHarmIndicators(text: string): DetectedIndicator[] {
  const indicators: DetectedIndicator[] = [];
  const seenCategories = new Map<string, number>();

  for (const entry of ALL_LEXICONS) {
    try {
      const pattern =
        entry.pattern instanceof RegExp
          ? entry.pattern
          : new RegExp(entry.pattern, 'gi');

      // Reset regex state
      pattern.lastIndex = 0;
      const matches: RegExpExecArray[] = [];
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text)) !== null) {
        matches.push(m);
        // Avoid infinite loop for zero-width matches
        if (m[0].length === 0) pattern.lastIndex++;
      }

      if (matches.length === 0) continue;

      // Use the first match for the excerpt
      const firstMatch = matches[0];
      const excerpt = extractExcerpt(text, firstMatch.index, 80);

      // Deduplicate by category (allow up to 3 distinct matches per category)
      const key = entry.category;
      const count = seenCategories.get(key) ?? 0;
      if (count >= 3) continue;
      seenCategories.set(key, count + 1);

      const id = `${entry.category}-${count}-${firstMatch.index}`;

      indicators.push({
        id,
        category: entry.category,
        label: entry.label,
        excerpt,
        explanation: `Detected pattern consistent with "${entry.label}" in ${entry.language === 'any' ? 'multiple languages' : entry.language.toUpperCase()} text.`,
        whyItMatters: WHY_IT_MATTERS[entry.category] ?? '',
        alternativeInterpretations: ALTERNATIVE_INTERPRETATIONS[entry.category] ?? [],
        severity: entry.severity,
      });
    } catch {
      // Silently skip malformed patterns
    }
  }

  // Sort by severity: high → medium → low
  const severityOrder = { high: 0, medium: 1, low: 2 };
  return indicators.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
