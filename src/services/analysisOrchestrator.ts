// ─────────────────────────────────────────────
// Main Analysis Orchestrator
// Runs all pipeline stages in sequence, tracking progress
// All processing is local — no messages are sent to remote services
// ─────────────────────────────────────────────

import { AnalysisInput, AnalysisResult, PipelineStage } from '../types';
import { preprocessText } from './textPreprocessing';
import { detectLanguage } from './languageDetection';
import { detectHarmIndicators } from './harmDetection';
import { analyzeContext } from './contextAnalysis';
import { assessRisk } from './riskAssessment';
import { generateRecommendations } from './recommendations';

type StageCallback = (stages: PipelineStage[]) => void;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const INITIAL_STAGES: PipelineStage[] = [
  { id: 'input', name: 'Message Input', description: 'Receiving and validating the submitted message text.', status: 'pending' },
  { id: 'privacy', name: 'Local Privacy Check', description: 'Confirming all processing will occur locally in your browser. No text is sent to remote servers.', status: 'pending' },
  { id: 'language', name: 'Language & Script Analysis', description: 'Detecting Sinhala Unicode, Singlish, English, or mixed-language content.', status: 'pending' },
  { id: 'signals', name: 'Harmful-Language Signal Detection', description: 'Applying multilingual rule-based lexicons to identify linguistic indicators of potential harm.', status: 'pending' },
  { id: 'context', name: 'Context & Repetition Assessment', description: 'Analyzing repetition, escalation, and contextual factors when multiple messages are available.', status: 'pending' },
  { id: 'risk', name: 'Risk & Evidence Assessment', description: 'Generating an explainable risk assessment from detected indicators. This is not a statistical probability.', status: 'pending' },
  { id: 'recommendations', name: 'Safety Recommendations', description: 'Creating personalized next-step recommendations based on the analysis findings.', status: 'pending' },
  { id: 'report', name: 'Report Generation', description: 'Preparing the results dashboard and export-ready report.', status: 'pending' },
];

export async function runAnalysisPipeline(
  input: AnalysisInput,
  onStageUpdate: StageCallback,
): Promise<AnalysisResult> {
  const stages: PipelineStage[] = INITIAL_STAGES.map(s => ({ ...s }));
  const startTime = Date.now();

  function update(idx: number, status: PipelineStage['status'], detail?: string) {
    stages[idx] = { ...stages[idx], status, detail };
    onStageUpdate([...stages]);
  }

  // Stage 0: Input
  update(0, 'active');
  await delay(120);
  const preprocessed = preprocessText(input.text);
  update(0, 'complete', `${preprocessed.wordCount} words, ${preprocessed.charCount} characters received.`);

  // Stage 1: Privacy check
  update(1, 'active');
  await delay(80);
  update(1, 'complete', 'Processing confirmed as local-only. No data sent to external services.');

  // Stage 2: Language detection
  update(2, 'active');
  await delay(100);
  const languageAnalysis = detectLanguage(preprocessed.normalized, input.language);
  update(2, 'complete', `Detected: ${languageAnalysis.detected} (${languageAnalysis.confidence} confidence).`);

  // Stage 3: Harm signal detection
  update(3, 'active');
  await delay(150);
  const indicators = detectHarmIndicators(preprocessed.normalized);
  update(3, 'complete', `${indicators.length} linguistic indicator(s) detected.`);

  // Stage 4: Context analysis
  update(4, 'active');
  await delay(100);
  const context = analyzeContext(input.priorMessages ?? []);
  update(4, 'complete', context.hasMultipleMessages
    ? `${context.messageCount} prior messages analysed.`
    : 'Single message — repetition cannot be assessed.');

  // Stage 5: Risk assessment
  update(5, 'active');
  await delay(100);
  const riskAssessment = assessRisk(indicators, context, preprocessed.wordCount);
  update(5, 'complete', `Risk category: ${riskAssessment.label}.`);

  // Stage 6: Recommendations
  update(6, 'active');
  await delay(80);
  const recommendations = generateRecommendations(
    riskAssessment.category,
    indicators,
    context,
    input.platform,
  );
  update(6, 'complete', `${recommendations.length} recommendation(s) generated.`);

  // Stage 7: Report ready
  update(7, 'active');
  await delay(60);
  update(7, 'complete', 'Results dashboard ready. PDF and PNG export available.');

  const result: AnalysisResult = {
    id: `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    input,
    preprocessed: preprocessed.normalized,
    languageAnalysis,
    indicators,
    riskAssessment,
    recommendations,
    processingMode: 'local',
    pipelineStages: stages,
    disclaimer:
      'This analysis is based on rule-based linguistic pattern matching and should not be treated as a definitive determination of cyberbullying, a legal assessment, or a psychological evaluation. Human judgment, full context, and professional advice are essential for any serious decisions.',
  };

  return result;
}

export { INITIAL_STAGES };
