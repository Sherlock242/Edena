'use server';
/**
 * @fileOverview A Genkit tool for fetching the latest space news.
 *
 * - spaceNewsTool - A Genkit tool that returns top space news headlines.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

export const spaceNewsTool = ai.defineTool(
  {
    name: 'spaceNews',
    description:
      'Get the latest news and headlines about space exploration, astronomy, and the space industry.',
    inputSchema: z.object({}), // No input needed
    outputSchema: z.string(),
  },
  async () => {
    try {
      const response = await fetch(
        `https://api.spaceflightnewsapi.net/v4/articles/?limit=5`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch space news.');
      }
      const data: any = await response.json();

      if (!data.results || data.results.length === 0) {
        return 'I could not retrieve any space news right now.';
      }

      const articles = data.results;

      const newsList = articles
        .map(
          (article: any, index: number) =>
            `${index + 1}. ${article.title} (Source: ${article.news_site})`
        )
        .join('\n');

      return `Here are the latest space news headlines:\n${newsList}`;
    } catch (error) {
      console.error('Space news API error:', error);
      return 'Sorry, I encountered an error while trying to get space news.';
    }
  }
);
