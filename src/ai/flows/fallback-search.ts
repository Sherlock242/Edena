'use server';

/**
 * @fileOverview A resilient flow that attempts to perform a search with a primary AI
 * and falls back to a secondary AI (OpenRouter) on failure.
 *
 * - fallbackSearch - A function that wraps the search logic with a try-catch block.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { performSearchPrompt } from './search';
import { GenerateRequest } from 'genkit/generate';

const FallbackSearchInputSchema = z.object({
  query: z.string().describe('The search query from the user.'),
});
type FallbackSearchInput = z.infer<typeof FallbackSearchInputSchema>;

const FallbackSearchOutputSchema = z.object({
  response: z.string().describe('The AI-generated answer to the search query.'),
});
type FallbackSearchOutput = z.infer<typeof FallbackSearchOutputSchema>;

// Define the primary and fallback models
const primaryModel = 'google/gemini-flash-1.5';
const fallbackModel = 'openrouter/openchat-3.5'; // A fast, free model on OpenRouter

export const fallbackSearch = ai.defineFlow(
  {
    name: 'fallbackSearchFlow',
    inputSchema: FallbackSearchInputSchema,
    outputSchema: FallbackSearchOutputSchema,
  },
  async (input) => {
    try {
      // Attempt 1: Try the primary Google AI model
      console.log(`Attempting search with primary model: ${primaryModel}`);
      const primaryRequest: GenerateRequest = {
        model: primaryModel,
        prompt: performSearchPrompt,
        input: { query: input.query },
      };
      const { output: primaryOutput } = await ai.generate(primaryRequest);
      
      if (primaryOutput?.response) {
        return { response: `(AI+API) ${primaryOutput.response}` };
      }
      // If there's no output, throw an error to trigger the fallback.
      throw new Error('Primary model did not return a valid response.');

    } catch (error) {
      console.warn(`Primary model failed:`, error, `\nSwitching to fallback model: ${fallbackModel}`);

      try {
        // Attempt 2: If the primary fails, use the OpenRouter fallback model
        const fallbackRequest: GenerateRequest = {
            model: fallbackModel,
            prompt: performSearchPrompt,
            input: { query: input.query },
            config: {
                // OpenRouter specific headers.
                // See: https://openrouter.ai/docs#api-reference
                custom: {
                    "HTTP-Referer": "https://firebaseship.com", // Replace with your actual site URL in production
                    "X-Title": "Edena AI" // Replace with your app name
                }
            }
        };
        const { output: fallbackOutput } = await ai.generate(fallbackRequest);
        
        if (fallbackOutput?.response) {
          return { response: `(AI+OR) ${fallbackOutput.response}` };
        }
        // If the fallback also fails to produce a valid output.
        throw new Error('Fallback model did not return a valid response.');
      
      } catch (fallbackError) {
        console.error('All fallbacks failed:', fallbackError);
        // Final response if all attempts fail
        return { response: "(System) I'm sorry, all of my reasoning circuits are currently unavailable. Please try again shortly." };
      }
    }
  }
);
