# SafeSpace LK

**A Privacy-Aware NLP Framework for Cyberbullying Detection and Digital Evidence Support in Sinhala-English Social Media Text.**

> Research application · University project · Privacy-first · Local NLP

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → Open http://localhost:5173

# Run tests
npm test

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Features

| Feature | Status |
|---|---|
| Local NLP analysis (no server) | ✅ |
| Sinhala Unicode detection | ✅ |
| Singlish (Sinhala-in-Latin) detection | ✅ |
| English + mixed-language support | ✅ |
| 8-stage animated pipeline | ✅ |
| Risk assessment (explainable, rule-based) | ✅ |
| Evidence workspace with checksums | ✅ |
| PDF report export (jsPDF) | ✅ |
| PNG report export (html-to-image) | ✅ |
| Sri Lanka interactive map (Leaflet/OSM) | ✅ |
| Personalized next-step recommendations | ✅ |
| Research & evaluation module | ✅ |
| PWA — installable, offline-capable | ✅ |
| Responsive (mobile + desktop) | ✅ |
| WCAG-oriented accessibility | ✅ |

---

## Project Structure

```
src/
  components/
    layout/          Layout.tsx (nav, footer)
    map/             SriLankaMap.tsx (Leaflet)
    visualizations/  PipelineViz.tsx
    ui/              PWAInstallPrompt.tsx
  pages/
    HomePage.tsx
    AnalysisPage.tsx
    ResultsPage.tsx
    EvidencePage.tsx
    ResearchPage.tsx
    PrivacyPage.tsx
  services/
    analysisOrchestrator.ts   (pipeline runner)
    textPreprocessing.ts
    languageDetection.ts
    harmDetection.ts
    contextAnalysis.ts
    riskAssessment.ts
    recommendations.ts
    reportGenerator.ts        (jsPDF + html-to-image)
    privacyManager.ts         (localStorage + Web Crypto)
  data/
    lexicons.ts               (EN / Singlish / Sinhala patterns)
    syntheticExamples.ts      (fictional demo data)
  hooks/
    useOnlineStatus.ts
  types/
    index.ts
  tests/
    setup.ts
    textPreprocessing.test.ts
    languageDetection.test.ts
    harmDetection.test.ts
public/
  favicon.svg
  offline.html
  icons/               (PWA icons — generate with any icon tool)
```

---

## Technology Stack

| Technology | Version | Purpose | License |
|---|---|---|---|
| React | ^19 | UI framework | MIT |
| TypeScript | ~6 | Type safety | Apache 2.0 |
| Vite | ^8 | Build tool | MIT |
| Tailwind CSS | ^4 | Styling | MIT |
| React Router | ^7 | Routing | MIT |
| Leaflet | ^1.9 | Map | BSD-2 |
| react-leaflet | ^5 | Leaflet React bindings | Hiram Chirino |
| framer-motion | ^14 | Animations | MIT |
| jsPDF | ^4 | PDF export | MIT |
| html-to-image | ^1.11 | PNG export | MIT |
| Lucide React | ^1.55 | Icons | ISC |
| Recharts | ^3 | Charts | MIT |
| vite-plugin-pwa | ^2 | Service worker / PWA | MIT |
| Vitest | ^5 | Testing | MIT |
| OpenStreetMap tiles | — | Map tiles | ODbL |

---

## Privacy Architecture

- **No backend, no database** — all analysis runs in the browser.
- **No remote API calls** for NLP — rule-based local lexicon matching.
- **Message text is never sent** to any remote service by default.
- **Evidence stored** in `localStorage` only (device-local, user-controlled).
- **Analysis results** stored in `sessionStorage` (cleared on tab close).
- **Reports** generated client-side and downloaded locally.
- **Checksums** computed using `Web Crypto API` (SHA-256).
- **Clear All Data** action in Privacy page removes all local data.

---

## Deployment

### Vercel (recommended)
```bash
npm run build
# Push to GitHub → connect to Vercel → auto-deploys from dist/
```

### Manual static hosting
```bash
npm run build
# Upload contents of dist/ to any static host (Netlify, GitHub Pages, etc.)
```

---

## Known Limitations

1. **Sinhala/Singlish lexicons are limited** — research-grade, not exhaustive. A trained Sinhala NLP model would significantly improve recall.
2. **No semantic understanding** — rule-based matching may miss implied threats or contextually harmful content.
3. **No model validation** — evaluation metrics on the Research page use synthetic fictional data only.
4. **Single-message analysis** — repetition and escalation require multiple messages as context.
5. **PWA icons** — placeholder SVG icons. Replace with proper 192×192 and 512×512 PNG files in `public/icons/`.
6. **Sinhala PDF rendering** — current jsPDF uses Helvetica which may not render Sinhala Unicode correctly. A Sinhala-compatible font (e.g., Noto Sans Sinhala) should be embedded for production use.

---

## Research Context

This application was developed as part of academic research:
> "A Privacy-Aware NLP Framework for Cyberbullying Detection and Digital Evidence Support in Sinhala-English Social Media Text."

It does not constitute legal advice, a police report, or a clinical assessment.
All synthetic example messages are fictional and clearly labeled.
For immediate safety concerns, contact local emergency services (119 in Sri Lanka).

---

## License

MIT — research and educational use.
