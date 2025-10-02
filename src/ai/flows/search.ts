
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

// Helper to check for valid search results
const isValidSearchResult = (result: string) => {
    if (!result) return false;
    const lowerResult = result.toLowerCase();
    return !lowerResult.includes('no direct answer') && !lowerResult.includes("couldn't perform a web search") && !lowerResult.includes('no results found');
}

/**
 * Tries to answer a query using a specific tool based on keywords.
 * Checks both the original query and a version with prefixes stripped.
 */
async function tryDirectApiCall(originalQuery: string): Promise<string | null> {
    const strippedQuery = stripQueryPrefix(originalQuery) || originalQuery;
    const lowerQuery = strippedQuery.toLowerCase();

    try {
        if (lowerQuery.startsWith('weather in ')) {
            const location = strippedQuery.substring('weather in '.length);
            const result = await weatherTool({ location });
            if (isValidSearchResult(result)) return `(PA) ${result}`;
        }
        if (lowerQuery.startsWith('define ')) {
            const word = strippedQuery.substring('define '.length);
            const result = await dictionaryTool({ word });
            if (isValidSearchResult(result)) return `(PA) ${result}`;
        }
    } catch (e) {
        console.warn("Direct API call failed, proceeding to next step.", e);
    }
    
    return null;
}


export async function performSearch(
  input: PerformSearchInput
): Promise<PerformSearchOutput> {
  const originalQuery = input.query;

  // Level 1: Check for simple greetings first.
  const greetingResponse = getGreetingResponse(originalQuery);
  if (greetingResponse) {
    return { response: `(G) ${greetingResponse}` };
  }
  
  // Level 2: Try a targeted API call.
  const directApiResponse = await tryDirectApiCall(originalQuery);
  if (directApiResponse) {
      return { response: directApiResponse };
  }

  // Level 3: Try DuckDuckGo search.
  try {
      const ddgResult = await ddgSearchTool({ query: originalQuery });
      if (isValidSearchResult(ddgResult)) {
          return { response: `(Dgg) ${ddgResult}` };
      }
  } catch (e) {
      console.warn("DDG search failed, proceeding to next step.", e);
  }

  // Level 4: If all direct methods fail, use the main AI flow.
  const finalQuery = stripQueryPrefix(originalQuery) || originalQuery;
  return performSearchFlow({ query: finalQuery });
}

const prompt = ai.definePrompt({
  name: 'performSearchPrompt',
  input: {schema: PerformSearchInputSchema},
  output: {schema: PerformSearchOutputSchema},
  tools: [wikipediaTool, weatherTool, dictionaryTool, booksTool, newsTool, youtubeTool, ddgSearchTool, articlesTool, cricketTool, mediaSearchTool, spaceNewsTool],
  prompt: `You are a helpful AI assistant named Edena. Your goal is to provide concise and accurate answers to the user's query.

You have access to several tools to help you answer questions. Based on the user's query, you must decide to use one of the tools to get the most up-to-date and relevant information. For specific topics like "first battle of panipat", prefer a specialized tool like Wikipedia over a general web search.

Query: {{{query}}}`,
});


const performSearchFlow = ai.defineFlow(
  {
    name: 'performSearchFlow',
    inputSchema: PerformSearchInputSchema,
    outputSchema: PerformSearchOutputSchema,
  },
  async input => {
    // This flow is now the main AI-powered step and contains the final fallbacks.
    try {
      const {output} = await prompt(input);
      if (output && isValidSearchResult(output.response)) {
        return { response: `(AI+API) ${output.response}` };
      }
      throw new Error("Primary AI prompt failed to produce a valid output.");
    } catch(e) {
        console.error("Primary search flow failed, attempting fallback search race.", e);
        // Fallback: Race DDG as a safety net.
        try {
            const ddgResult = await ddgSearchTool(input);
            if (isValidSearchResult(ddgResult)) {
                return { response: `(Dgg) ${ddgResult}` };
            }
            throw new Error("Fallback DDG search was inconclusive.");
        } catch (fallbackError) {
             // Final Fallback: Force the AI to use another tool.
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
