// ─────────────────────────────────────────────
// Lexicons for harm detection
// Contains multilingual signal patterns for Sinhala, Singlish, and English
// These are research-oriented, rule-based indicators — NOT a trained model
// ─────────────────────────────────────────────

import type { IndicatorCategory } from '../types';

export interface LexiconEntry {
  pattern: string | RegExp;
  category: IndicatorCategory;
  label: string;
  severity: 'low' | 'medium' | 'high';
  language: 'en' | 'si' | 'singlish' | 'any';
}

// ─── English insults / personal attacks ─────
const englishInsults: LexiconEntry[] = [
  { pattern: /\b(stupid|idiot|moron|dumbass|loser|ugly|worthless|pathetic|trash|garbage)\b/gi, category: 'direct_insult', label: 'Personal insult', severity: 'medium', language: 'en' },
  { pattern: /\b(hate you|i hate u|despise you)\b/gi, category: 'direct_insult', label: 'Expressed hatred', severity: 'medium', language: 'en' },
  { pattern: /\b(kill yourself|kys|go die|end your life|you should die)\b/gi, category: 'threat', label: 'Self-harm incitement', severity: 'high', language: 'en' },
  { pattern: /\b(i('ll| will| am going to) (kill|hurt|destroy|ruin) you)\b/gi, category: 'threat', label: 'Direct threat', severity: 'high', language: 'en' },
  { pattern: /\b(watch your back|you('ll| will) regret|you('re| are) dead|making you pay)\b/gi, category: 'threat', label: 'Veiled threat', severity: 'high', language: 'en' },
  { pattern: /\b(shut up|shut your mouth)\b/gi, category: 'coercive', label: 'Silencing language', severity: 'low', language: 'en' },
  { pattern: /\b(b[i*]tch|wh[o*]re|sl[u*]t|c[u*]nt|f[a*]ggot)\b/gi, category: 'direct_insult', label: 'Highly offensive slur', severity: 'high', language: 'en' },
  { pattern: /\b(rape|i('ll| will) rape|sexual assault)\b/gi, category: 'sexual_harassment', label: 'Sexual violence threat', severity: 'high', language: 'en' },
  { pattern: /\b(send (me |your )?(nudes?|photos?|pics?|pictures?))\b/gi, category: 'sexual_harassment', label: 'Unsolicited sexual request', severity: 'high', language: 'en' },
  { pattern: /\b(i know where you (live|work|go to school|study))\b/gi, category: 'doxxing', label: 'Location-based threat', severity: 'high', language: 'en' },
  { pattern: /\b(i('ll| will) expose|post your (photos?|nudes?|address|info))\b/gi, category: 'doxxing', label: 'Threat to expose private information', severity: 'high', language: 'en' },
  { pattern: /\b(racist|n[i*]gg[ae]r|terrorist|go back to your country)\b/gi, category: 'discriminatory', label: 'Racial/ethnic discrimination', severity: 'high', language: 'en' },
  { pattern: /\b(you('re| are) (nothing|nobody|worthless|a nobody))\b/gi, category: 'degrading', label: 'Degrading language', severity: 'medium', language: 'en' },
  { pattern: /\b(everyone (hates|knows) you|no one (likes|cares about) you)\b/gi, category: 'degrading', label: 'Social isolation language', severity: 'medium', language: 'en' },
];

// ─── Singlish patterns (Sinhala written in English characters) ───
const singlishPatterns: LexiconEntry[] = [
  { pattern: /\b(balla|baalla|ballanta)\b/gi, category: 'direct_insult', label: 'Singlish insult (animal)', severity: 'medium', language: 'singlish' },
  { pattern: /\b(hora|horanta)\b/gi, category: 'direct_insult', label: 'Singlish insult (thief)', severity: 'medium', language: 'singlish' },
  { pattern: /\b(pissu|pissunta|pissuwa)\b/gi, category: 'direct_insult', label: 'Singlish insult (crazy)', severity: 'low', language: 'singlish' },
  { pattern: /\b(boru|borunta)\b/gi, category: 'direct_insult', label: 'Singlish — calling someone a liar', severity: 'low', language: 'singlish' },
  { pattern: /\b(maranawa|maranne|maramu|maru)\b/gi, category: 'threat', label: 'Singlish threat (kill)', severity: 'high', language: 'singlish' },
  { pattern: /\b(gahamu|gahanne|gahanawa)\b/gi, category: 'threat', label: 'Singlish threat (hit)', severity: 'high', language: 'singlish' },
  { pattern: /\b(kela|kelanta)\b/gi, category: 'sexual_harassment', label: 'Singlish sexual insult', severity: 'high', language: 'singlish' },
  { pattern: /\b(puka|puke|punchi puka)\b/gi, category: 'sexual_harassment', label: 'Singlish sexual insult', severity: 'high', language: 'singlish' },
  { pattern: /\b(tharaha|tharamu)\b/gi, category: 'coercive', label: 'Singlish — threatening challenge', severity: 'medium', language: 'singlish' },
  { pattern: /\b(mukuth danna|mukuth dakka)\b/gi, category: 'doxxing', label: 'Singlish — "I know your face/identity"', severity: 'medium', language: 'singlish' },
  { pattern: /\b(den dakke|salli karamu)\b/gi, category: 'coercive', label: 'Singlish coercion language', severity: 'medium', language: 'singlish' },
];

// ─── Sinhala Unicode patterns ─────────────────
// Sinhala script range: U+0D80–U+0DFF
const sinhalaPatterns: LexiconEntry[] = [
  // Common Sinhala abusive words (Unicode)
  { pattern: /[බ][ල්ල][ා]/, category: 'direct_insult', label: 'Sinhala insult', severity: 'medium', language: 'si' },
  { pattern: /[මර][ව]/, category: 'threat', label: 'Sinhala threat (kill/die)', severity: 'high', language: 'si' },
  { pattern: /[ගහ][ම]/, category: 'threat', label: 'Sinhala threat (beat)', severity: 'high', language: 'si' },
  { pattern: /[හෝ][ර][ා]/, category: 'direct_insult', label: 'Sinhala — thief insult', severity: 'medium', language: 'si' },
  { pattern: /[ව[ේ][ශ][්]?[ය][ා]?]/, category: 'direct_insult', label: 'Sinhala sexual insult', severity: 'high', language: 'si' },
];

// ─── Context / repetition patterns ───────────
export const REPETITION_THRESHOLD = 3; // messages count to consider repeated contact
export const ESCALATION_KEYWORDS = ['or else', 'last warning', 'final warning', 'last chance', 'you will regret'];

export const ALL_LEXICONS: LexiconEntry[] = [
  ...englishInsults,
  ...singlishPatterns,
  ...sinhalaPatterns,
];

// ─── Category metadata ───────────────────────
export const CATEGORY_META: Record<IndicatorCategory, { label: string; color: string; icon: string }> = {
  direct_insult: { label: 'Direct Insult', color: '#f59e0b', icon: 'MessageCircleX' },
  degrading: { label: 'Degrading Language', color: '#f97316', icon: 'ThumbsDown' },
  threat: { label: 'Threat', color: '#ef4444', icon: 'AlertTriangle' },
  coercive: { label: 'Coercive Language', color: '#f97316', icon: 'Lock' },
  sexual_harassment: { label: 'Sexual Harassment', color: '#ef4444', icon: 'ShieldAlert' },
  discriminatory: { label: 'Discriminatory Language', color: '#ef4444', icon: 'Users' },
  doxxing: { label: 'Privacy Threat / Doxxing', color: '#ef4444', icon: 'Eye' },
  repeated_contact: { label: 'Repeated Unwanted Contact', color: '#f59e0b', icon: 'Repeat' },
  identity_attack: { label: 'Identity-Based Attack', color: '#ef4444', icon: 'User' },
};
