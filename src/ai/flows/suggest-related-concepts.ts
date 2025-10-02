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
  prompt: `You are an AI assistant designed to suggest related concepts to ideas provided by the user.

You will determine whether to use a hierarchical relationship (is-a), compositional relationship (has-a), and property-based relationship (is-like) depending on the subject matter of the ideas being used to generate related concepts.

Ideas: {{{ideas}}}`,
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
