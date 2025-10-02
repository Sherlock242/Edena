'use server';
/**
 * @fileOverview A Genkit tool for fetching the latest cricket news.
 *
 * - cricketTool - A Genkit tool that returns top cricket headlines.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

export const cricketTool = ai.defineTool(
  {
    name: 'cricket',
    description:
      'Get the latest news and headlines from the world of cricket. Use this for general queries about what is happening in cricket.',
    inputSchema: z.object({}), // No input needed
    outputSchema: z.string(),
  },
  async () => {
    try {
      // Using a public API from GNews which allows filtering by topic without an API key for some queries.
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=cricket&lang=en&token=0c12517596827a4d4a84497a61214e49`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch cricket news.');
      }
      const data: any = await response.json();

      if (!data.articles || data.articles.length === 0) {
        return 'I could not retrieve any cricket news right now.';
      }

      // Get the top 5 articles
      const articles = data.articles.slice(0, 5);

      const newsList = articles
        .map(
          (article: any, index: number) =>
            `${index + 1}. ${article.title} (Source: ${article.source.name})`
        )
        .join('\n');

      return `Here are the latest cricket headlines:\n${newsList}`;
    } catch (error) {
      console.error('Cricket news API error:', error);
      return 'Sorry, I encountered an error while trying to get cricket news.';
    }
  }
);
