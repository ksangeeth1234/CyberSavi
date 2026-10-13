// ─────────────────────────────────────────────
// Synthetic Example Messages — clearly labeled as fictional/illustrative
// Used for "Load Sample" feature. NOT real incidents.
// ─────────────────────────────────────────────

import type { AnalysisInput } from '../types';

export const SYNTHETIC_EXAMPLES: Array<{
  id: string;
  title: string;
  description: string;
  input: AnalysisInput;
}> = [
  {
    id: 'en-threat-1',
    title: 'English — Direct Threat (Fictional)',
    description: 'Fictional example of an English-language threat message.',
    input: {
      text: "You better watch your back. I know where you go to school and I will make you regret everything you did. This is your last warning.",
      platform: 'Social Media (Fictional)',
      dateTime: '2024-03-15T14:30',
      context: 'Fictional scenario for demonstration purposes only.',
      language: 'english',
    },
  },
  {
    id: 'singlish-insult-1',
    title: 'Singlish — Insult + Coercion (Fictional)',
    description: 'Fictional example of a Singlish-language message with insults.',
    input: {
      text: "Balla, tharamu balanawa. Pissu wena epa. Den dakke karamu umba. Hora.",
      platform: 'Messaging App (Fictional)',
      dateTime: '2024-03-10T09:00',
      context: 'Fictional Singlish scenario for demonstration.',
      language: 'singlish',
    },
  },
  {
    id: 'mixed-harassment-1',
    title: 'Mixed Language — Harassment (Fictional)',
    description: 'Fictional example mixing English and Singlish.',
    input: {
      text: "You think you're so smart? Balla kauda umba. Everyone hates you. Maranawa umbata. Watch out.",
      platform: 'Online Forum (Fictional)',
      dateTime: '2024-04-01T16:45',
      context: 'Fictional mixed-language scenario.',
      language: 'mixed',
    },
  },
  {
    id: 'en-doxxing-1',
    title: 'English — Privacy Threat (Fictional)',
    description: 'Fictional example of a doxxing / exposure threat.',
    input: {
      text: "I have all your photos and I know your home address. If you don't do what I say, I will post everything online for everyone to see.",
      platform: 'Direct Message (Fictional)',
      dateTime: '2024-02-20T22:00',
      context: 'Fictional doxxing scenario for demonstration.',
      language: 'english',
    },
  },
  {
    id: 'ambiguous-1',
    title: 'Ambiguous — Possible Banter (Fictional)',
    description: 'Fictional example that may be friendly banter or mild insult — demonstrating system limitations.',
    input: {
      text: "You absolute idiot lmao!! Can't believe you actually did that haha. You're unbelievable.",
      platform: 'Chat (Fictional)',
      dateTime: '2024-05-05T12:00',
      context: "This may be friendly teasing among close friends. Demonstrates system's limitations with context.",
      language: 'english',
    },
  },
  {
    id: 'en-sexual-harassment-1',
    title: 'English — Sexual Harassment (Fictional)',
    description: 'Fictional example of sexual harassment language.',
    input: {
      text: "Send me your photos or I'll share what I already have. You have no choice.",
      platform: 'Messaging (Fictional)',
      dateTime: '2024-01-15T20:00',
      context: 'Fictional sexual coercion scenario.',
      language: 'english',
    },
  },
];
