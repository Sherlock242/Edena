'use server';

/**
 * @fileOverview A resilient flow that attempts to perform a search with a primary AI.
 *
 * - fallbackSearch - A function that wraps the search logic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
      // Attempt to use the primary Google AI model with a simplified prompt
      console.log(`Attempting search with primary model: ${primaryModel}`);
      
      const response = await ai.generate({
        model: primaryModel,
        prompt: `You are Edena, a precise and logical AI. Answer the following user query directly and concisely.\n\nUser Query: ${input.query}`,
      });

      const text = response.text;
      
      if (text) {
        return { response: `(AI) ${text}` };
      }
      
      throw new Error('Primary model did not return a valid text response.');

    } catch (error) {
      console.error('Fallback search flow failed:', error);
      // Final response if all attempts fail
      return { response: "(System) I'm sorry, I'm having trouble connecting to my AI services at the moment. Please check your configuration or try again shortly." };
    }
  }
);
