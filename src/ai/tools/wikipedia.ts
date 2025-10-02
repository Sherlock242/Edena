'use server';
/**
 * @fileOverview A Genkit tool for searching Wikipedia.
 *
 * - wikipediaTool - A Genkit tool that takes a search query and returns a summary from Wikipedia.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fetch from 'node-fetch';

const WikipediaInputSchema = z.object({
  query: z.string().describe('The topic to search for on Wikipedia.'),
});

export const wikipediaTool = ai.defineTool(
  {
    name: 'wikipedia',
    description: 'Look up a topic on Wikipedia and get a summary.',
    inputSchema: WikipediaInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&redirects=1&titles=${encodeURIComponent(
        input.query
      )}`;
      const response = await fetch(url);
      if (!response.ok) {
        return 'Sorry, I had trouble reaching Wikipedia.';
      }
      const data: any = await response.json();
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];

      if (pageId === '-1') {
        return `I couldn't find a Wikipedia article for "${input.query}".`;
      }
      const extract = pages[pageId].extract;
      // Return the first paragraph as a summary
      return extract ? extract.split('\n')[0] : 'I found an article but could not get a summary.';
    } catch (error) {
      console.error('Wikipedia API error:', error);
      return 'Sorry, I encountered an error while trying to search Wikipedia.';
    }
  }
);
