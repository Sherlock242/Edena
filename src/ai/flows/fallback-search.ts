'use server';

/**
 * @fileOverview A resilient flow that attempts to perform a search with a primary AI.
 *
 * - fallbackSearch - A function that wraps the search logic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { performSearchPrompt } from './search';
import { GenerateRequest } from 'genkit/generate';

const FallbackSearchInputSchema = z.object({
  query: z.string().describe('The search query from the user.'),
});
export type FallbackSearchInput = z.infer<typeof FallbackSearchInputSchema>;

const FallbackSearchOutputSchema = z.object({
  response: z.string().describe('The AI-generated answer to the search query.'),
});
export type FallbackSearchOutput = z.infer<typeof FallbackSearchOutputSchema>;

// Define the primary model
const primaryModel = 'googleai/gemini-1.5-flash-latest';

export async function fallbackSearch(
  input: FallbackSearchInput
): Promise<FallbackSearchOutput> {
  return fallbackSearchFlow(input);
}

const fallbackSearchFlow = ai.defineFlow(
  {
    name: 'fallbackSearchFlow',
    inputSchema: FallbackSearchInputSchema,
    outputSchema: FallbackSearchOutputSchema,
  },
  async (input) => {
    try {
      // Attempt to use the primary Google AI model
      console.log(`Attempting search with primary model: ${primaryModel}`);
      const primaryRequest: GenerateRequest = {
        model: primaryModel,
        prompt: performSearchPrompt,
        input: { query: input.query },
      };
      const { output: primaryOutput } = await ai.generate(primaryRequest);
      
      if (primaryOutput?.response) {
        return { response: `(AI) ${primaryOutput.response}` };
      }
      
      throw new Error('Primary model did not return a valid response.');

    } catch (error) {
      console.error('Search flow failed:', error);
      // Final response if all attempts fail
      return { response: "(System) I'm sorry, I'm having trouble connecting to my AI services at the moment. Please check your configuration or try again shortly." };
    }
  }
);
