'use server';
/**
 * @fileOverview A Genkit tool for performing a web search using a SearxNG instance (SnexEngine).
 *
 * - snexengineTool - A Genkit tool that takes a search query and returns web search results.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

const SnexEngineInputSchema = z.object({
  query: z.string().describe('The search query for the web search.'),
});

export const snexengineTool = ai.defineTool(
  {
    name: 'snexengine',
    description: 'Performs a web search using a public SearxNG instance to answer general questions.',
    inputSchema: SnexEngineInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      // Using a public SearxNG instance. These can be unreliable, but are good for a free tool.
      const response = await fetch(
        `https://searx.work/search?q=${encodeURIComponent(
          input.query
        )}&format=json`
      );

      if (!response.ok) {
        return `I couldn't perform a web search with SnexEngine for "${input.query}".`;
      }

      const data: any = await response.json();
      
      if (!data.results || data.results.length === 0) {
        return `No results found on SnexEngine for "${input.query}".`;
      }

      const topResult = data.results[0];
      if (topResult && topResult.content) {
        return `Here's a result from SnexEngine for "${input.query}": ${topResult.title} - ${topResult.content}`;
      }
      if (topResult && topResult.title) {
        return `Here is the top result from SnexEngine for "${input.query}": ${topResult.title}`;
      }

      return `I found some information for "${input.query}" on SnexEngine but couldn't create a concise summary.`;

    } catch (error) {
      console.error('SnexEngine API error:', error);
      return 'Sorry, I encountered an error while trying to perform a SnexEngine web search.';
    }
  }
);
