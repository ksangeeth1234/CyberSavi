// ─────────────────────────────────────────────
// SafeSpace LK — Core Types
// ─────────────────────────────────────────────

export type DetectedLanguage =
  | 'sinhala'
  | 'singlish'
  | 'english'
  | 'mixed'
  | 'unknown';

export type RiskCategory =
  | 'no_indicators'
  | 'potentially_harmful'
  | 'possible_harassment'
  | 'threat_urgent'
  | 'insufficient';

export type IndicatorCategory =
  | 'direct_insult'
  | 'degrading'
  | 'threat'
  | 'coercive'
  | 'sexual_harassment'
  | 'discriminatory'
  | 'doxxing'
  | 'repeated_contact'
  | 'identity_attack';

export interface DetectedIndicator {
  id: string;
  category: IndicatorCategory;
  label: string;
  excerpt: string;
  explanation: string;
  whyItMatters: string;
  alternativeInterpretations: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface LanguageAnalysis {
  detected: DetectedLanguage;
  confidence: 'low' | 'medium' | 'high';
  scripts: string[];
  hasSinhalaUnicode: boolean;
  hasSinglishPatterns: boolean;
  hasEnglish: boolean;
  mixDetails: string;
}

export interface RiskAssessment {
  category: RiskCategory;
  label: string;
  color: string;
  indicatorCount: number;
  highSeverityCount: number;
  evidenceStrength: 'weak' | 'moderate' | 'strong';
  immediateAction: boolean;
  explanation: string;
  limitations: string[];
}

export interface AnalysisInput {
  text: string;
  platform?: string;
  dateTime?: string;
  context?: string;
  language?: DetectedLanguage | 'auto';
  priorMessages?: string[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  input: AnalysisInput;
  preprocessed: string;
  languageAnalysis: LanguageAnalysis;
  indicators: DetectedIndicator[];
  riskAssessment: RiskAssessment;
  recommendations: Recommendation[];
  processingMode: 'local';
  pipelineStages: PipelineStage[];
  disclaimer: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  durationMs?: number;
  detail?: string;
}

export interface Recommendation {
  id: string;
  priority: 'immediate' | 'soon' | 'general';
  title: string;
  description: string;
  actionType:
    | 'document'
    | 'platform'
    | 'authority'
    | 'support'
    | 'personal_safety'
    | 'technical';
  externalUrl?: string;
  completed: boolean;
}

// ─── Evidence ───────────────────────────────

export interface EvidenceItem {
  id: string;
  type: 'message' | 'screenshot' | 'note';
  originalText?: string;
  platform?: string;
  dateTime?: string;
  context?: string;
  analysisFindings?: string[];
  screenshotFile?: {
    name: string;
    size: number;
    dataUrl: string;
    checksum?: string;
  };
  notes?: string;
  includeInReport: boolean;
  addedAt: string;
}

// ─── Research / Evaluation ──────────────────

export interface EvaluationSample {
  id: string;
  text: string;
  trueLabel: RiskCategory;
  language: DetectedLanguage;
  source: 'synthetic';
}

export interface ConfusionData {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
}

export interface EvaluationMetrics {
  precision: number;
  recall: number;
  f1: number;
  accuracy: number;
  confusion: ConfusionData;
}

// ─── Map ────────────────────────────────────

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  description: string;
  isIllustrative: true;
}
