// ─────────────────────────────────────────────
// Recommendations Service
// Stage 6 — Generates personalized next-step recommendations
// based on detected risk, indicators, and user-provided context
// ─────────────────────────────────────────────

import { Recommendation, RiskCategory, DetectedIndicator } from '../types';
import { ContextAnalysisResult } from './contextAnalysis';

let recIdCounter = 0;
function makeId(): string { return `rec-${++recIdCounter}`; }

export function generateRecommendations(
  category: RiskCategory,
  indicators: DetectedIndicator[],
  context: ContextAnalysisResult,
  platform?: string,
): Recommendation[] {
  const recs: Recommendation[] = [];

  const hasThreat = indicators.some(i => i.category === 'threat');
  const hasDoxxing = indicators.some(i => i.category === 'doxxing');
  const hasSexual = indicators.some(i => i.category === 'sexual_harassment');

  // ─── Immediate safety ────────────────────
  if (hasThreat || hasDoxxing || hasSexual) {
    recs.push({
      id: makeId(),
      priority: 'immediate',
      title: 'Ensure your immediate safety',
      description: 'If you believe you are in immediate physical danger, contact local emergency services (119 in Sri Lanka) or a trusted person right away. Do not wait.',
      actionType: 'personal_safety',
      completed: false,
    });
  }

  // ─── Document evidence ───────────────────
  if (category !== 'no_indicators' && category !== 'insufficient') {
    recs.push({
      id: makeId(),
      priority: 'immediate',
      title: 'Preserve original messages and screenshots',
      description: 'Before taking any other action, save the original messages, screenshots, and any relevant conversation context. Include dates, times, and the platform name. Do not edit or alter the originals.',
      actionType: 'document',
      completed: false,
    });
  }

  // ─── Platform actions ────────────────────
  recs.push({
    id: makeId(),
    priority: category === 'no_indicators' ? 'general' : 'soon',
    title: platform ? `Report the content on ${platform}` : 'Report through the platform\'s official reporting tools',
    description: `Use the platform's built-in report or block feature. This creates a record with the platform. ${platform ? `Look for the report option in ${platform}'s settings or message options.` : ''}`,
    actionType: 'platform',
    completed: false,
  });

  recs.push({
    id: makeId(),
    priority: 'soon',
    title: 'Mute, restrict, or block the account',
    description: 'Most platforms allow you to restrict who can contact you. This can reduce further contact without notifying the other party.',
    actionType: 'platform',
    completed: false,
  });

  // ─── Technical security ──────────────────
  recs.push({
    id: makeId(),
    priority: 'soon',
    title: 'Review your account privacy settings',
    description: 'Check who can see your profile, contact you, or find you by email or phone. Consider making your account private.',
    actionType: 'technical',
    completed: false,
  });

  if (hasDoxxing || hasThreat) {
    recs.push({
      id: makeId(),
      priority: 'soon',
      title: 'Enable multi-factor authentication',
      description: 'Add an extra layer of security to your accounts with two-factor authentication (2FA). This prevents unauthorized account access.',
      actionType: 'technical',
      completed: false,
    });
  }

  // ─── Avoid escalating ────────────────────
  recs.push({
    id: makeId(),
    priority: 'general',
    title: 'Avoid responding to or escalating the conversation',
    description: 'Responding can sometimes encourage further contact. Consider not replying, especially if the language is threatening or harassing.',
    actionType: 'personal_safety',
    completed: false,
  });

  // ─── Seek support ────────────────────────
  recs.push({
    id: makeId(),
    priority: 'soon',
    title: 'Seek support from a trusted person',
    description: 'Talk to a trusted friend, family member, teacher, counsellor, or university student services. You do not need to manage this alone.',
    actionType: 'support',
    completed: false,
  });

  // ─── Authority reporting ─────────────────
  if (hasThreat || hasDoxxing || hasSexual || category === 'threat_urgent') {
    recs.push({
      id: makeId(),
      priority: 'immediate',
      title: 'Report to Sri Lankan authorities if appropriate',
      description: 'If you believe a crime has occurred, you may report to the Sri Lanka Police Cybercrime Division. Preserve all evidence before reporting. You are not obligated to report — this is your decision.',
      actionType: 'authority',
      externalUrl: 'https://cybercrime.lk',
      completed: false,
    });

    recs.push({
      id: makeId(),
      priority: 'soon',
      title: 'Contact the Sri Lanka Computer Emergency Readiness Team (SL-CERT)',
      description: 'SL-CERT provides guidance on cybersecurity incidents including online harassment. They can advise on steps to take.',
      actionType: 'authority',
      externalUrl: 'https://www.cert.gov.lk',
      completed: false,
    });
  }

  // ─── General advice ──────────────────────
  recs.push({
    id: makeId(),
    priority: 'general',
    title: 'Keep a record of dates and contextual information',
    description: 'Note when each incident occurred, what was said, where it happened, and any witnesses or screenshots. A detailed timeline strengthens any formal report.',
    actionType: 'document',
    completed: false,
  });

  return recs;
}
