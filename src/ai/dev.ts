import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-patient-progress.ts';
import '@/ai/flows/generate-personalized-exercise-suggestions.ts';
import '@/ai/flows/explain-hand-movement-quality.ts';