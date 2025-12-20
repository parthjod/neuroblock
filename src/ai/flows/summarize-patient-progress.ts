'use server';
/**
 * @fileOverview Summarizes a patient's progress over time, highlighting key improvements or regressions in their hand movements.
 *
 * - summarizePatientProgress - A function that handles the summarization of patient progress.
 * - SummarizePatientProgressInput - The input type for the summarizePatientProgress function.
 * - SummarizePatientProgressOutput - The return type for the summarizePatientProgress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePatientProgressInputSchema = z.object({
  patientId: z.string().describe('The ID of the patient to summarize progress for.'),
  movementData: z.string().describe('JSON string of time-series hand movement data, including range of motion (%), stability (tremor / variance), and completion accuracy scores over multiple sessions.'),
});
export type SummarizePatientProgressInput = z.infer<typeof SummarizePatientProgressInputSchema>;

const SummarizePatientProgressOutputSchema = z.object({
  summary: z.string().describe('A summary of the patient\'s progress over time, highlighting key improvements or regressions in their hand movements.'),
});
export type SummarizePatientProgressOutput = z.infer<typeof SummarizePatientProgressOutputSchema>;

export async function summarizePatientProgress(input: SummarizePatientProgressInput): Promise<SummarizePatientProgressOutput> {
  return summarizePatientProgressFlow(input);
}

const summarizePatientProgressPrompt = ai.definePrompt({
  name: 'summarizePatientProgressPrompt',
  input: {schema: SummarizePatientProgressInputSchema},
  output: {schema: SummarizePatientProgressOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing patient rehabilitation progress.

  As a doctor, I want a summary of the patient's progress over time, highlighting key improvements or regressions in their hand movements, so I can efficiently monitor their recovery and make informed decisions about their treatment plan.

  Summarize the patient progress using the following movement data. Focus on range of motion (%), stability (tremor / variance), and completion accuracy scores.

  Patient ID: {{{patientId}}}
  Movement Data: {{{movementData}}}
  `,
});

const summarizePatientProgressFlow = ai.defineFlow(
  {
    name: 'summarizePatientProgressFlow',
    inputSchema: SummarizePatientProgressInputSchema,
    outputSchema: SummarizePatientProgressOutputSchema,
  },
  async input => {
    const {output} = await summarizePatientProgressPrompt(input);
    return output!;
  }
);
