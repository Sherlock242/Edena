
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
import { jokesTool } from '../tools/jokes';
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
const isValidSearchResult = (result: string | null | undefined): result is string => {
    if (!result) return false;
    const lowerResult = result.toLowerCase();
    return !lowerResult.includes('no direct answer') && 
           !lowerResult.includes("couldn't perform a web search") && 
           !lowerResult.includes('no results found') &&
           !lowerResult.includes('could not find') &&
           !lowerResult.includes('encountered an error');
}

type ToolDefinition = {
    tool: (input: any) => Promise<string>;
    keywords: string[];
    getInput: (query: string, keyword: string) => any;
};

// Define all specialized tools with their keywords and input processors.
const specializedTools: ToolDefinition[] = [
    {
        tool: weatherTool,
        keywords: ['weather in', 'forecast for', 'weather for'],
        getInput: (query, keyword) => ({ location: query.substring(keyword.length).trim() }),
    },
    {
        tool: dictionaryTool,
        keywords: ['define', 'definition of', 'meaning of'],
        getInput: (query, keyword) => ({ word: query.substring(keyword.length).trim() }),
    },
    {
        tool: booksTool,
        keywords: ['book about', 'books on', 'find book', 'search for book'],
        getInput: (query, keyword) => ({ query: query.substring(keyword.length).trim() }),
    },
    {
        tool: newsTool,
        keywords: ['latest news', 'top stories', 'hacker news'],
        getInput: () => ({}),
    },
    {
        tool: cricketTool,
        keywords: ['cricket score', 'cricket news', 'latest cricket'],
        getInput: () => ({}),
    },
    {
        tool: spaceNewsTool,
        keywords: ['space news', 'latest space', 'astronomy news'],
        getInput: () => ({}),
    },
    {
        tool: youtubeTool,
        keywords: ['youtube video on', 'find video on', 'search youtube for'],
        getInput: (query, keyword) => ({ query: query.substring(keyword.length).trim() }),
    },
    {
        tool: mediaSearchTool,
        keywords: ['movie', 'tv show', 'anime'],
        getInput: (query, keyword) => {
            const category = keyword as 'movie' | 'tv show' | 'anime';
            const justQuery = query.replace(keyword, '').trim();
            return { query: justQuery, category: category === 'tv show' ? 'tv' : category };
        },
    },
    {
        tool: articlesTool,
        keywords: ['article on', 'articles about', 'find article'],
        getInput: (query, keyword) => ({ query: query.substring(keyword.length).trim() }),
    },
    {
        tool: jokesTool,
        keywords: ['tell me a joke', 'tell a joke', 'say a joke', 'joke'],
        getInput: () => ({}),
    }
];


/**
 * Tries to answer a query by matching it against specialized tool keywords.
 * It checks the raw query and a version with common prefixes stripped.
 * Returns the API response if successful.
 */
async function tryDirectApiCall(originalQuery: string): Promise<string | null> {
    const queriesToCheck = [originalQuery];
    
    // Also check a version with common conversational prefixes stripped off.
    const strippedQuery = stripQueryPrefix(originalQuery);
    if (strippedQuery && strippedQuery.toLowerCase() !== originalQuery.toLowerCase()) {
        queriesToCheck.push(strippedQuery);
    }
    
    for (const query of queriesToCheck) {
        const lowerQuery = query.toLowerCase();
        for (const { tool, keywords, getInput } of specializedTools) {
            for (const keyword of keywords) {
                // Match if query starts with keyword or is the keyword itself
                if (lowerQuery.startsWith(keyword + ' ') || lowerQuery === keyword) {
                    try {
                        const input = getInput(query, keyword);
                        const result = await tool(input);
                        if (isValidSearchResult(result)) {
                            return `(PA) ${result}`;
                        }
                    } catch (e) {
                        // Log the error but proceed to the next tool/method
                        console.warn(`Direct API call for '${keyword}' failed, proceeding.`, e);
                    }
                }
            }
        }
    }
    
    return null; // No direct API call was successful
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
  
  // Level 2: Try a targeted API call (handles prefixes internally).
  const directApiResult = await tryDirectApiCall(originalQuery);
  if (directApiResult) {
      return { response: directApiResult };
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
  return performSearchFlow({ query: originalQuery });
}

const prompt = ai.definePrompt({
  name: 'performSearchPrompt',
  input: {schema: PerformSearchInputSchema},
  output: {schema: z.object({ response: z.string() })},
  tools: [wikipediaTool, weatherTool, dictionaryTool, booksTool, newsTool, youtubeTool, ddgSearchTool, articlesTool, cricketTool, mediaSearchTool, spaceNewsTool, jokesTool],
  prompt: `You are a helpful AI assistant named Edena. Your goal is to provide concise and accurate answers to the user's query.

IMPORTANT: You must detect the language of the user's query. Your response MUST be in the same language and use the same script (e.g., Devanagari for Hindi). Do NOT provide a transliterated (Roman-character) response for other languages.

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
