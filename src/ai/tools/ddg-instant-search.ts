'use server';
/**
 * @fileOverview A Genkit tool for performing a quick web search using DuckDuckGo Instant Answers.
 *
 * - ddgInstantSearchTool - A Genkit tool that takes a search query and returns a summary.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

const DDGSearchInputSchema = z.object({
  query: z.string().describe('The search query for DuckDuckGo.'),
});

export const ddgInstantSearchTool = ai.defineTool(
  {
    name: 'ddgInstantSearch',
    description: 'Performs a web search using DuckDuckGo to get a quick summary or answer. Good for simple facts.',
    inputSchema: DDGSearchInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(input.query)}&format=json&no_html=1&skip_disambig=1`
      );
      if (!response.ok) {
        // This is not a critical failure, just means no instant answer.
        return `No instant answer found on DuckDuckGo for "${input.query}".`;
      }
      const data: any = await response.json();

      if (data.AbstractText) {
        return data.AbstractText;
      }
      if (data.RelatedTopics && data.RelatedTopics.length > 0 && data.RelatedTopics[0].Text) {
         return data.RelatedTopics[0].Text;
      }

      return `No instant answer found on DuckDuckGo for "${input.query}".`;
    } catch (error) {
      console.error('DuckDuckGo Instant Answer API error:', error);
      return 'Sorry, I encountered an error while searching with DuckDuckGo.';
    }
  }
);
