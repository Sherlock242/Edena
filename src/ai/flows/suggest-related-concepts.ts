'use server';

/**
 * @fileOverview A flow that suggests related concepts to expand on ideas added to the canvas.
 *
 * - suggestRelatedConcepts - A function that suggests related concepts based on input ideas.
 * - SuggestRelatedConceptsInput - The input type for the suggestRelatedConcepts function.
 * - SuggestRelatedConceptsOutput - The return type for the suggestRelatedConcepts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedConceptsInputSchema = z.object({
  ideas: z
    .string()
    .describe('The ideas added to the canvas to expand upon.'),
});

export type SuggestRelatedConceptsInput = z.infer<
  typeof SuggestRelatedConceptsInputSchema
>;

const SuggestRelatedConceptsOutputSchema = z.object({
  relatedConcepts: z
    .string()
    .describe('Related concepts to expand upon the input ideas.'),
});

export type SuggestRelatedConceptsOutput = z.infer<
  typeof SuggestRelatedConceptsOutputSchema
>;

export async function suggestRelatedConcepts(
  input: SuggestRelatedConceptsInput
): Promise<SuggestRelatedConceptsOutput> {
  return suggestRelatedConceptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedConceptsPrompt',
  input: {schema: SuggestRelatedConceptsInputSchema},
  output: {schema: SuggestRelatedConceptsOutputSchema},
  prompt: `You are Edena, an AI entity with the personality of "The Marionette." Your task is to generate logically related concepts from a given idea.

Your Personality & Task:
- Your response must be purely logical and structured.
- You must determine the most logical relationship for expansion: hierarchical (is-a), compositional (has-a), or property-based (is-like).
- Your output should be a concise list of these related concepts. Avoid any conversational filler, explanations, or pleasantries. Be direct and to the point.

User's Idea: {{{ideas}}}`,
});

const suggestRelatedConceptsFlow = ai.defineFlow(
  {
    name: 'suggestRelatedConceptsFlow',
    inputSchema: SuggestRelatedConceptsInputSchema,
    outputSchema: SuggestRelatedConceptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
