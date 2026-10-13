// ─────────────────────────────────────────────
// Report Generator Service
// Generates PDF and PNG reports client-side
// Uses jsPDF and html-to-image — no server upload
// ─────────────────────────────────────────────

import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { AnalysisResult, EvidenceItem, Recommendation } from '../types';

export interface ReportOptions {
  incidentReference?: string;
  selectedEvidence: EvidenceItem[];
  includeChecklist: boolean;
  recommendations: Recommendation[];
  filename?: string;
}

// ─── PDF Generation ───────────────────────────

export async function generatePDF(
  result: AnalysisResult,
  options: ReportOptions,
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const margin = 15;
  const pageWidth = 210;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  const primary = [37, 99, 235] as [number, number, number]; // blue-600
  const text = [30, 41, 59] as [number, number, number];     // slate-800
  const muted = [100, 116, 139] as [number, number, number]; // slate-500
  const risk = result.riskAssessment.color;

  function hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  function checkPageBreak(needed: number) {
    if (y + needed > 280) {
      doc.addPage();
      y = margin;
    }
  }

  function addLine(text_: string, size = 10, bold = false, color = text) {
    checkPageBreak(size * 0.5 + 3);
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text_, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * (size * 0.45) + 2;
  }

  function addDivider() {
    checkPageBreak(6);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
  }

  function addSection(title: string) {
    checkPageBreak(16);
    y += 4;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y - 2, contentWidth, 10, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primary);
    doc.text(title, margin + 3, y + 5);
    y += 14;
  }

  // ─── Header ────────────────────────────────
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('SafeSpace LK', margin, 13);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Privacy-Aware Cyberbullying Detection & Evidence Support', margin, 20);
  y = 36;

  // ─── Metadata ──────────────────────────────
  addLine(`Report Generated: ${new Date(result.timestamp).toLocaleString('en-LK')}`, 9, false, muted);
  if (options.incidentReference) addLine(`Incident Reference: ${options.incidentReference}`, 9, true);
  addLine('Processing Mode: Local-only — message text was not sent to any remote server.', 9, false, muted);
  addDivider();

  // ─── Risk Category ─────────────────────────
  addSection('Risk Assessment');
  const riskRgb = hexToRgb(risk);
  doc.setFillColor(...riskRgb);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(result.riskAssessment.label, margin + 4, y + 8);
  y += 16;
  addLine(`Evidence Strength: ${result.riskAssessment.evidenceStrength.toUpperCase()}`, 10);
  addLine(result.riskAssessment.explanation, 10);
  addDivider();

  // ─── Language Analysis ─────────────────────
  addSection('Language Analysis');
  addLine(`Detected Language: ${result.languageAnalysis.detected.toUpperCase()}`, 10, true);
  addLine(`Confidence: ${result.languageAnalysis.confidence}`, 10);
  addLine(result.languageAnalysis.mixDetails, 10);
  addDivider();

  // ─── Indicators ────────────────────────────
  addSection('Detected Linguistic Indicators');
  if (result.indicators.length === 0) {
    addLine('No significant linguistic indicators were detected.', 10);
  } else {
    for (const ind of result.indicators) {
      checkPageBreak(24);
      addLine(`• ${ind.label} [${ind.severity.toUpperCase()}]`, 10, true);
      addLine(`  Excerpt: "${ind.excerpt}"`, 9, false, muted);
      addLine(`  ${ind.explanation}`, 9);
      addLine(`  Why it matters: ${ind.whyItMatters}`, 9);
      y += 2;
    }
  }
  addDivider();

  // ─── Evidence ──────────────────────────────
  if (options.selectedEvidence.length > 0) {
    addSection('Evidence Items');
    for (const ev of options.selectedEvidence) {
      checkPageBreak(20);
      addLine(`Type: ${ev.type}`, 10, true);
      if (ev.platform) addLine(`Platform: ${ev.platform}`, 9);
      if (ev.dateTime) addLine(`Date/Time: ${ev.dateTime}`, 9);
      if (ev.originalText) addLine(`Message: ${ev.originalText.slice(0, 300)}${ev.originalText.length > 300 ? '…' : ''}`, 9);
      if (ev.notes) addLine(`Notes: ${ev.notes}`, 9, false, muted);
      if (ev.screenshotFile?.checksum) addLine(`SHA-256 Checksum: ${ev.screenshotFile.checksum}`, 8, false, muted);
      y += 3;
    }
    addDivider();
  }

  // ─── Recommendations ───────────────────────
  addSection('Recommended Next Actions');
  for (const rec of options.recommendations) {
    checkPageBreak(16);
    const status = options.includeChecklist
      ? (rec.completed ? '[✓]' : '[ ]')
      : '';
    addLine(`${status} ${rec.title} [${rec.priority.toUpperCase()}]`, 10, true);
    addLine(`   ${rec.description}`, 9, false, muted);
    y += 2;
  }
  addDivider();

  // ─── Limitations ───────────────────────────
  addSection('Analysis Limitations');
  for (const lim of result.riskAssessment.limitations) {
    addLine(`• ${lim}`, 9, false, muted);
  }
  addDivider();

  // ─── Disclaimer ────────────────────────────
  addSection('Research & Safety Disclaimer');
  addLine(result.disclaimer, 9, false, muted);
  addLine('This report was generated by SafeSpace LK — a research-oriented tool developed as part of academic work on privacy-aware NLP for Sinhala-English social media text. It does not constitute legal advice, a police report, or a clinical assessment.', 9, false, muted);

  const filename = (options.filename || 'safespace-lk-report') + '.pdf';
  doc.save(filename);
}

// ─── PNG Generation ───────────────────────────

export async function generatePNG(
  element: HTMLElement,
  filename?: string,
): Promise<void> {
  const dataUrl = await toPng(element, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  });
  const link = document.createElement('a');
  link.download = (filename || 'safespace-lk-report') + '.png';
  link.href = dataUrl;
  link.click();
}

// ─── Print ────────────────────────────────────

export function printReport(element: HTMLElement): void {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>SafeSpace LK Report</title>
        <style>
          body { font-family: 'Inter', sans-serif; margin: 20px; color: #1e293b; }
          h1 { color: #2563eb; }
          @media print { @page { margin: 15mm; } }
        </style>
      </head>
      <body>${element.innerHTML}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}
