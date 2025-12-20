'use server';

/**
 * @fileOverview An AI agent that explains the quality of hand movements based on provided metrics.
 *
 * - explainHandMovementQuality - A function that handles the explanation of hand movement quality.
 * - ExplainHandMovementQualityInput - The input type for the explainHandMovementQuality function.
 * - ExplainHandMovementQualityOutput - The return type for the explainHandMovementQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainHandMovementQualityInputSchema = z.object({
  rangeOfMotionPercentage: z
    .number()
    .describe('The range of motion achieved as a percentage (0-100).'),
  stabilityVariance: z
    .number()
    .describe(
      'A measure of stability during the movement, represented as the variance in position data. Lower values indicate higher stability.'
    ),
  completionAccuracy: z
    .number()
    .describe(
      'The accuracy of completing the movement, represented as a percentage (0-100).'
    ),
  movementDescription: z
    .string()
    .describe('Description of the hand movement performed by the patient.'),
});
export type ExplainHandMovementQualityInput = z.infer<
  typeof ExplainHandMovementQualityInputSchema
>;

const ExplainHandMovementQualityOutputSchema = z.object({
  clinicalExplanation: z
    .string()
    .describe(
      'A clinical explanation of the hand movement quality, incorporating the range of motion, stability, and accuracy metrics.'
    ),
  recommendations: z
    .string()
    .describe(
      'Specific recommendations based on the movement quality analysis, tailored for the doctor.'
    ),
});
export type ExplainHandMovementQualityOutput = z.infer<
  typeof ExplainHandMovementQualityOutputSchema
>;

export async function explainHandMovementQuality(
  input: ExplainHandMovementQualityInput
): Promise<ExplainHandMovementQualityOutput> {
  return explainHandMovementQualityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainHandMovementQualityPrompt',
  input: {schema: ExplainHandMovementQualityInputSchema},
  output: {schema: ExplainHandMovementQualityOutputSchema},
  prompt: `You are an AI assistant providing clinical explanations of patient hand movement quality for doctors.

You are provided with the following metrics for a specific hand movement:

Movement Description: {{{movementDescription}}}
Range of Motion: {{{rangeOfMotionPercentage}}}%
Stability (Variance): {{{stabilityVariance}}}
Completion Accuracy: {{{completionAccuracy}}}%

Based on these metrics, provide a concise clinical explanation of the patient's hand movement quality.
Incorporate the range of motion, stability, and accuracy metrics into your explanation.
Also, give specific recommendations based on the movement quality analysis, tailored for the doctor.
`,
});

const explainHandMovementQualityFlow = ai.defineFlow(
  {
    name: 'explainHandMovementQualityFlow',
    inputSchema: ExplainHandMovementQualityInputSchema,
    outputSchema: ExplainHandMovementQualityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
