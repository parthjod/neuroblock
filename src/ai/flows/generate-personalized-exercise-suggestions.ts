'use server';

/**
 * @fileOverview Generates personalized exercise suggestions for patients based on tracked movement data and progress.
 *
 * - generatePersonalizedExerciseSuggestions - A function that generates exercise suggestions.
 * - ExerciseSuggestionInput - The input type for the generatePersonalizedExerciseSuggestions function.
 * - ExerciseSuggestionOutput - The return type for the generatePersonalizedExerciseSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExerciseSuggestionInputSchema = z.object({
  patientId: z.string().describe('The ID of the patient.'),
  movementData: z.string().describe('The tracked movement data of the patient, including range of motion (%), stability (tremor / variance), and completion accuracy.'),
  progressSummary: z.string().describe('A summary of the patient\'s progress in previous sessions.'),
});
export type ExerciseSuggestionInput = z.infer<typeof ExerciseSuggestionInputSchema>;

const ExerciseSuggestionOutputSchema = z.object({
  exerciseSuggestions: z.string().describe('Personalized exercise suggestions for the patient.'),
  reasoning: z.string().describe('Explanation of why these exercises are suggested based on the movement data and progress.'),
});
export type ExerciseSuggestionOutput = z.infer<typeof ExerciseSuggestionOutputSchema>;

export async function generatePersonalizedExerciseSuggestions(
  input: ExerciseSuggestionInput
): Promise<ExerciseSuggestionOutput> {
  return generatePersonalizedExerciseSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedExerciseSuggestionsPrompt',
  input: {schema: ExerciseSuggestionInputSchema},
  output: {schema: ExerciseSuggestionOutputSchema},
  prompt: `You are an AI assistant that generates personalized exercise suggestions for patients undergoing hand rehabilitation.

  Based on the patient's movement data, which includes range of motion (%), stability (tremor / variance), and completion accuracy, and a summary of their progress, provide targeted exercise suggestions to improve their motor control.

  Patient ID: {{{patientId}}}
  Movement Data: {{{movementData}}}
  Progress Summary: {{{progressSummary}}}

  Provide specific exercise suggestions and explain the reasoning behind them.
  `,
});

const generatePersonalizedExerciseSuggestionsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedExerciseSuggestionsFlow',
    inputSchema: ExerciseSuggestionInputSchema,
    outputSchema: ExerciseSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
