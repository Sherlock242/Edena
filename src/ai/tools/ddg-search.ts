'use server';
/**
 * @fileOverview A Genkit tool for performing a web search using the DuckDuckGo API.
 *
 * - ddgSearchTool - A Genkit tool that takes a search query and returns web search results.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

const DDGSearchInputSchema = z.object({
  query: z.string().describe('The search query for the web search.'),
});

export const ddgSearchTool = ai.defineTool(
  {
    name: 'ddgSearch',
    description: 'Performs a web search using DuckDuckGo to answer general questions.',
    inputSchema: DDGSearchInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(
          input.query
        )}&format=json&t=genkit`
      );

      if (!response.ok) {
        return `I couldn't perform a web search for "${input.query}".`;
      }

      const data: any = await response.json();
      
      if (!data.AbstractText && !data.RelatedTopics.length) {
        return `No direct answer or related topics found for "${input.query}".`;
      }

      if (data.AbstractText) {
        return `Here's a summary for "${input.query}": ${data.AbstractText}`;
      }
      
      const topResult = data.RelatedTopics[0];
      if (topResult) {
        return `Here is the top result for "${input.query}": ${topResult.Text}`;
      }

      return `I found some information for "${input.query}" but couldn't create a concise summary.`;

    } catch (error) {
      console.error('DuckDuckGo API error:', error);
      return 'Sorry, I encountered an error while trying to perform a web search.';
    }
  }
);
