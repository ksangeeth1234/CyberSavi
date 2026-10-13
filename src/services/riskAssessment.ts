// ─────────────────────────────────────────────
// Risk Assessment Service
// Stage 5 of the NLP pipeline
// Explainable, rule-based — does NOT produce statistical probabilities
// ─────────────────────────────────────────────

import { DetectedIndicator, RiskAssessment, RiskCategory } from '../types';
import { ContextAnalysisResult } from './contextAnalysis';

/**
 * Compute a transparent, explainable risk assessment.
 *
 * IMPORTANT: The result is a structured linguistic assessment — NOT a
 * statistically calibrated probability of cyberbullying having occurred.
 * A single high-severity indicator triggers immediate safety guidance
 * regardless of overall count.
 */
export function assessRisk(
  indicators: DetectedIndicator[],
  context: ContextAnalysisResult,
  textLength: number,
): RiskAssessment {
  if (textLength < 3) {
    return {
      category: 'insufficient',
      label: 'Insufficient Evidence to Assess',
      color: '#94a3b8',
      indicatorCount: 0,
      highSeverityCount: 0,
      evidenceStrength: 'weak',
      immediateAction: false,
      explanation: 'The submitted text is too short or does not contain enough content for linguistic analysis.',
      limitations: [
        'Very short texts cannot be assessed reliably.',
        'Please provide more context or the full message.',
      ],
    };
  }

  const highSeverity = indicators.filter(i => i.severity === 'high');
  const mediumSeverity = indicators.filter(i => i.severity === 'medium');
  const lowSeverity = indicators.filter(i => i.severity === 'low');

  const hasThreat = indicators.some(i => i.category === 'threat');
  const hasDoxxing = indicators.some(i => i.category === 'doxxing');
  const hasSexualHarassment = indicators.some(i => i.category === 'sexual_harassment');
  const immediateAction = hasThreat || hasDoxxing || hasSexualHarassment;

  let category: RiskCategory;
  let label: string;
  let color: string;
  let evidenceStrength: 'weak' | 'moderate' | 'strong';

  if (indicators.length === 0) {
    category = 'no_indicators';
    label = 'No Strong Indicators Detected';
    color = '#22c55e';
    evidenceStrength = 'weak';
  } else if (highSeverity.length >= 2 || (hasThreat && indicators.length >= 2)) {
    category = 'threat_urgent';
    label = 'Potential Threat or Urgent Safety Concern';
    color = '#ef4444';
    evidenceStrength = 'strong';
  } else if (context.repetitionDetected || context.escalationDetected || indicators.length >= 4) {
    category = 'possible_harassment';
    label = 'Possible Repeated Harassment';
    color = '#f97316';
    evidenceStrength = 'moderate';
  } else if (indicators.length >= 1) {
    category = 'potentially_harmful';
    label = 'Potentially Harmful Language';
    color = '#f59e0b';
    evidenceStrength = indicators.length >= 2 ? 'moderate' : 'weak';
  } else {
    category = 'no_indicators';
    label = 'No Strong Indicators Detected';
    color = '#22c55e';
    evidenceStrength = 'weak';
  }

  const limitations = buildLimitations(indicators, context);

  return {
    category,
    label,
    color,
    indicatorCount: indicators.length,
    highSeverityCount: highSeverity.length,
    evidenceStrength,
    immediateAction,
    explanation: buildExplanation(category, indicators, highSeverity, mediumSeverity, lowSeverity, context),
    limitations,
  };
}

function buildExplanation(
  category: RiskCategory,
  indicators: DetectedIndicator[],
  high: DetectedIndicator[],
  medium: DetectedIndicator[],
  low: DetectedIndicator[],
  context: ContextAnalysisResult,
): string {
  if (category === 'insufficient') return '';
  if (category === 'no_indicators') {
    return 'The linguistic analysis did not detect strong indicators of harmful language in the submitted text. This does not mean the message is harmless — context, tone, relationship, and prior communication are important factors that automated analysis cannot fully assess.';
  }

  const parts: string[] = [];
  parts.push(`The analysis detected ${indicators.length} linguistic signal(s):`);
  if (high.length > 0) parts.push(`${high.length} high-severity indicator(s) including categories: ${[...new Set(high.map(i => i.label))].join(', ')}.`);
  if (medium.length > 0) parts.push(`${medium.length} medium-severity indicator(s).`);
  if (low.length > 0) parts.push(`${low.length} low-severity indicator(s).`);
  if (context.repetitionDetected) parts.push('Repeated-contact patterns were detected across multiple messages.');
  if (context.escalationDetected) parts.push('Escalation language was detected in the message history.');

  return parts.join(' ');
}

function buildLimitations(
  indicators: DetectedIndicator[],
  context: ContextAnalysisResult,
): string[] {
  const limitations = [
    'This is a rule-based linguistic analysis and does not constitute a definitive determination of cyberbullying.',
    'Automated text analysis cannot account for tone of voice, relationship context, prior history, or cultural nuance.',
    'A single message with harmful language does not prove a repeated pattern of harassment.',
    'False positives are possible — friendly banter, jokes, or reclaimed language may be misclassified.',
    'False negatives are also possible — harmful behaviour may not always be visible in the language alone.',
  ];
  if (indicators.some(i => ['singlish', 'si'].includes('si'))) {
    limitations.push('Sinhala and Singlish lexicon coverage is limited. The system may miss culturally specific expressions.');
  }
  if (!context.hasMultipleMessages) {
    limitations.push('Only a single message was analysed. Repetition and escalation cannot be assessed from one message.');
  }
  return limitations;
}
