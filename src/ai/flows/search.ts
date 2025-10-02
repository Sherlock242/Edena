
'use server';

/**
 * @fileOverview A flow that performs a search using an AI model and various tools.
 *
 * - performSearch - A function that takes a query and returns a search result.
 * - PerformSearchInput - The input type for the performSearch function.
 * - PerformSearchOutput - The return type for the performSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {wikipediaTool} from '../tools/wikipedia';
import {weatherTool} from '../tools/weather';
import {dictionaryTool} from '../tools/dictionary';
import {booksTool} from '../tools/books';
import {newsTool} from '../tools/news';
import { youtubeTool } from '../tools/youtube';
import { ddgSearchTool } from '../tools/ddg-search';
import { articlesTool } from '../tools/articles';
import { cricketTool } from '../tools/cricket';
import { mediaSearchTool } from '../tools/media-search';
import { spaceNewsTool } from '../tools/space-news';
import { getGreetingResponse } from '../greetings';
import { stripQueryPrefix } from '../prefixes';

const PerformSearchInputSchema = z.object({
  query: z.string().describe('The search query from the user.'),
});

export type PerformSearchInput = z.infer<typeof PerformSearchInputSchema>;

const PerformSearchOutputSchema = z.object({
  response: z.string().describe('The AI-generated answer to the search query.'),
});

export type PerformSearchOutput = z.infer<typeof PerformSearchOutputSchema>;

export async function performSearch(
  input: PerformSearchInput
): Promise<PerformSearchOutput> {
  const greetingResponse = getGreetingResponse(input.query);
  if (greetingResponse) {
    return { response: greetingResponse };
  }

  const strippedQuery = stripQueryPrefix(input.query);
  const finalQuery = strippedQuery || input.query;

  return performSearchFlow({ query: finalQuery });
}

const prompt = ai.definePrompt({
  name: 'performSearchPrompt',
  input: {schema: PerformSearchInputSchema},
  output: {schema: PerformSearchOutputSchema},
  tools: [wikipediaTool, weatherTool, dictionaryTool, booksTool, newsTool, youtubeTool, ddgSearchTool, articlesTool, cricketTool, mediaSearchTool, spaceNewsTool],
  prompt: `You are a helpful AI assistant named Edena. Your goal is to provide concise and accurate answers to the user's query.

You have access to several tools to help you answer questions. Based on the user's query, you can decide to use one of the tools to get the most up-to-date and relevant information.

Query: {{{query}}}`,
});

const performSearchFlow = ai.defineFlow(
  {
    name: 'performSearchFlow',
    inputSchema: PerformSearchInputSchema,
    outputSchema: PerformSearchOutputSchema,
  },
  async input => {
    try {
        // First, try a quick direct search.
        const ddgResult = await ddgSearchTool(input);
        // A simple check to see if the result is a direct answer or a "not found" message.
        if (ddgResult && !ddgResult.toLowerCase().includes('no direct answer') && !ddgResult.toLowerCase().includes('couldn\'t perform a web search')) {
          // If we get a decent answer, return it immediately.
          return { response: ddgResult };
        }
    } catch (e) {
        console.warn("Initial DDG search failed, proceeding to main AI flow.", e);
    }
    
    // If the quick search fails or doesn't provide a good answer, use the full AI.
    try {
      const {output} = await prompt(input);
      if (output) {
        return output;
      }
      throw new Error("Primary prompt failed to produce an output.");
    } catch(e) {
        console.error("Primary search flow failed, attempting final fallback.", e);
        // Fallback to a direct web search if the main prompt fails
        const fallbackResult = await ddgSearchTool(input);
        return { response: fallbackResult };
    }
  }
);
