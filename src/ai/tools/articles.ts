'use server';
/**
 * @fileOverview A Genkit tool for searching for general-purpose articles using the Inoreader API.
 *
 * - articlesTool - A Genkit tool that takes a search query and returns relevant articles.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

// This App ID is a public, non-sensitive identifier for the Inoreader API.
const INOREADER_APP_ID = '1000001337';

const ArticlesInputSchema = z.object({
  query: z.string().describe('The topic or keywords to search for in articles.'),
});

export const articlesTool = ai.defineTool(
  {
    name: 'articles',
    description:
      'Search for general-purpose news and articles from a wide variety of sources on the web.',
    inputSchema: ArticlesInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      const response = await fetch(
        `https://www.inoreader.com/api/0/search/articles.json?AppId=${INOREADER_APP_ID}&query=${encodeURIComponent(
          input.query
        )}`
      );
      if (!response.ok) {
        return `I couldn't find any articles matching "${input.query}".`;
      }
      const data: any = await response.json();
      const articles = data.results.slice(0, 5); // Get top 5 results

      if (articles.length === 0) {
        return `No articles found for "${input.query}".`;
      }

      const articleList = articles
        .map(
          (article: any) =>
            `- "${article.title}" from ${article.origin.title} (Link: ${article.canonical[0].href})`
        )
        .join('\n');

      return `Here are some articles I found:\n${articleList}`;
    } catch (error) {
      console.error('Inoreader API error:', error);
      return 'Sorry, I encountered an error while trying to search for articles.';
    }
  }
);
