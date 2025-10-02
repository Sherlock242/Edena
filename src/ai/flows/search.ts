
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
import { snexengineTool } from '../tools/snexengine';
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
  // Level 1: Check for simple greetings first. This is instant and local.
  const greetingResponse = getGreetingResponse(input.query);
  if (greetingResponse) {
    return { response: `(G) ${greetingResponse}` };
  }

  // Level 2: Strip common prefixes to get a cleaner query for all subsequent steps.
  const strippedQuery = stripQueryPrefix(input.query);
  const finalQuery = strippedQuery || input.query;

  return performSearchFlow({ query: finalQuery });
}

const prompt = ai.definePrompt({
  name: 'performSearchPrompt',
  input: {schema: PerformSearchInputSchema},
  output: {schema: PerformSearchOutputSchema},
  tools: [wikipediaTool, weatherTool, dictionaryTool, booksTool, newsTool, youtubeTool, ddgSearchTool, articlesTool, cricketTool, mediaSearchTool, spaceNewsTool, snexengineTool],
  prompt: `You are a helpful AI assistant named Edena. Your goal is to provide concise and accurate answers to the user's query.

You have access to several tools to help you answer questions. Based on the user's query, you must decide to use one of the tools to get the most up-to-date and relevant information. For specific topics like "first battle of panipat", prefer a specialized tool like Wikipedia over a general web search.

Query: {{{query}}}`,
});

// Helper function to check for valid search results
const isValidSearchResult = (result: string) => {
    if (!result) return false;
    const lowerResult = result.toLowerCase();
    return !lowerResult.includes('no direct answer') && !lowerResult.includes("couldn't perform a web search") && !lowerResult.includes('no results found');
}

const performSearchFlow = ai.defineFlow(
  {
    name: 'performSearchFlow',
    inputSchema: PerformSearchInputSchema,
    outputSchema: PerformSearchOutputSchema,
  },
  async input => {
    // Level 3: Targeted single-API check for very direct queries
    try {
        if (input.query.toLowerCase().startsWith('weather in ')) {
            const location = input.query.substring('weather in '.length);
            const weatherResult = await weatherTool({ location });
            return { response: `(PA) ${weatherResult}` };
        }
        if (input.query.toLowerCase().startsWith('define ')) {
            const word = input.query.substring('define '.length);
            const dictResult = await dictionaryTool({ word });
            return { response: `(PA) ${dictResult}` };
        }
    } catch (e) {
        console.warn("Targeted API call failed, proceeding to main AI flow.", e);
    }
    
    // Level 4: Engage the full AI with all tools. The AI is smart enough to choose the best tool.
    try {
      const {output} = await prompt(input);
      if (output && isValidSearchResult(output.response)) {
        return { response: `(AI+API) ${output.response}` };
      }
      throw new Error("Primary AI prompt failed to produce a valid output.");
    } catch(e) {
        console.error("Primary search flow failed, attempting fallback search race.", e);
        // Level 5: Fallback Search Race. If the main AI fails, try the search engines.
        try {
            const raceWinner = await Promise.any([
                snexengineTool(input).then(res => ({source: 'Snex', result: res})),
                ddgSearchTool(input).then(res => ({source: 'Dgg', result: res}))
            ]);
            
            if (isValidSearchResult(raceWinner.result)) {
                return { response: `(${raceWinner.source}) ${raceWinner.result}` };
            }
            throw new Error("Fallback search race was inconclusive.");
        } catch (fallbackError) {
             // Level 6: Ultimate Fallback. Force the AI to use another tool.
            console.error("Fallback search race also failed, attempting final tool-based search.", fallbackError);
            try {
                const finalAttemptInput = { query: "Search with a tool: " + input.query };
                const { output } = await prompt(finalAttemptInput);
                 if (output && isValidSearchResult(output.response)) {
                    return { response: `(AI+API) ${output.response}` };
                }
                throw new Error("Final tool-based search attempt failed to produce an output.");
            } catch (finalError) {
                console.error("All search methods failed.", finalError);
                return { response: "(System) I'm sorry, but I'm having trouble connecting to all of my information sources right now. Please try again in a moment." };
            }
        }
    }
  }
);
