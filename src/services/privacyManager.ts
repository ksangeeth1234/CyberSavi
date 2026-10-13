// ─────────────────────────────────────────────
// Privacy Manager Service
// Manages local data — no remote storage
// ─────────────────────────────────────────────

import { AnalysisResult, EvidenceItem } from '../types';

const STORAGE_KEY_EVIDENCE = 'safespace_lk_evidence';
const STORAGE_KEY_ANALYSIS = 'safespace_lk_last_analysis';

/** Save evidence to localStorage (optional, user-initiated) */
export function saveEvidence(items: EvidenceItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EVIDENCE, JSON.stringify(items));
  } catch {
    // Storage may be unavailable or full
  }
}

/** Load evidence from localStorage */
export function loadEvidence(): EvidenceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVIDENCE);
    if (!raw) return [];
    return JSON.parse(raw) as EvidenceItem[];
  } catch {
    return [];
  }
}

/** Save last analysis result to sessionStorage (cleared when tab closes) */
export function saveAnalysisSession(result: AnalysisResult): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_ANALYSIS, JSON.stringify(result));
  } catch {
    // Session storage may be unavailable
  }
}

/** Load analysis result from sessionStorage */
export function loadAnalysisSession(): AnalysisResult | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_ANALYSIS);
    if (!raw) return null;
    return JSON.parse(raw) as AnalysisResult;
  } catch {
    return null;
  }
}

/** Clear all locally stored data */
export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_EVIDENCE);
    sessionStorage.removeItem(STORAGE_KEY_ANALYSIS);
  } catch {
    // Ignore
  }
}

/** Generate SHA-256 checksum for a file/text using Web Crypto API */
export async function generateChecksum(data: string | ArrayBuffer): Promise<string> {
  const buffer =
    typeof data === 'string'
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Check if localStorage is available */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__safespace_test__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/** Get storage usage estimate */
export function getStorageUsage(): { used: number; available: boolean } {
  const available = isLocalStorageAvailable();
  if (!available) return { used: 0, available: false };
  
  let used = 0;
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('safespace_lk_')) {
        used += (localStorage.getItem(key) ?? '').length * 2; // UTF-16 bytes
      }
    }
  } catch {
    // Ignore
  }
  return { used, available };
}
