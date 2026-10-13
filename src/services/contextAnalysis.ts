// ─────────────────────────────────────────────
// Context Analysis Service
// Stage 4 of the NLP pipeline — analyzes repetition and escalation
// ─────────────────────────────────────────────

import type { DetectedIndicator } from '../types';
import { REPETITION_THRESHOLD, ESCALATION_KEYWORDS } from '../data/lexicons';
import { detectHarmIndicators } from './harmDetection';
import { preprocessText } from './textPreprocessing';

export interface ContextAnalysisResult {
  hasMultipleMessages: boolean;
  messageCount: number;
  repetitionDetected: boolean;
  escalationDetected: boolean;
  priorMessageIndicators: DetectedIndicator[];
  contextNotes: string[];
}

/**
 * Analyze context from multiple messages
 * Detects repetition and escalation patterns
 * IMPORTANT: Does not treat repetition as definitive proof of harassment
 */
export function analyzeContext(priorMessages: string[]): ContextAnalysisResult {
  const contextNotes: string[] = [];

  if (priorMessages.length === 0) {
    return {
      hasMultipleMessages: false,
      messageCount: 0,
      repetitionDetected: false,
      escalationDetected: false,
      priorMessageIndicators: [],
      contextNotes: [
        'Only a single message was provided. Repetition and escalation patterns cannot be assessed.',
        'Cyberbullying typically involves repeated behaviour — a single message cannot confirm a pattern.',
      ],
    };
  }

  const allPriorIndicators: DetectedIndicator[] = [];
  for (const msg of priorMessages) {
    const { normalized } = preprocessText(msg);
    const indicators = detectHarmIndicators(normalized);
    allPriorIndicators.push(...indicators);
  }

  const repetitionDetected = priorMessages.length >= REPETITION_THRESHOLD;
  let escalationDetected = false;

  for (const msg of priorMessages) {
    const lower = msg.toLowerCase();
    if (ESCALATION_KEYWORDS.some(kw => lower.includes(kw))) {
      escalationDetected = true;
      break;
    }
  }

  if (repetitionDetected) {
    contextNotes.push(
      `${priorMessages.length} prior messages were provided. Repeated contact may be a factor, but requires full context to assess.`
    );
  }
  if (escalationDetected) {
    contextNotes.push(
      'Escalation language (e.g., "last warning", "you will regret") was detected in prior messages.'
    );
  }
  if (allPriorIndicators.length > 0) {
    contextNotes.push(
      `${allPriorIndicators.length} linguistic signal(s) were detected across ${priorMessages.length} prior message(s).`
    );
  }

  contextNotes.push(
    'Important: Automated repetition detection may miss important context such as the relationship between the parties, consent, or prior exchanges not included here.'
  );

  return {
    hasMultipleMessages: true,
    messageCount: priorMessages.length,
    repetitionDetected,
    escalationDetected,
    priorMessageIndicators: allPriorIndicators,
    contextNotes,
  };
}
