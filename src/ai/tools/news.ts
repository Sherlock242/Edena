'use server';
/**
 * @fileOverview A Genkit tool for fetching top news stories from Hacker News.
 *
 * - newsTool - A Genkit tool that returns top stories.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

export const newsTool = ai.defineTool(
  {
    name: 'news',
    description:
      'Get the current top stories from Hacker News. Use this when asked about news, latest articles, or current events.',
    inputSchema: z.object({}), // No input needed
    outputSchema: z.string(),
  },
  async () => {
    try {
      // Get top story IDs
      const topStoriesResponse = await fetch(
        'https://hacker-news.firebaseio.com/v0/topstories.json'
      );
      if (!topStoriesResponse.ok) {
        throw new Error('Failed to fetch top story IDs from Hacker News.');
      }
      const topStoryIds: number[] = await topStoriesResponse.json();

      // Get details for the top 5 stories
      const storyPromises = topStoryIds.slice(0, 5).map(async (id) => {
        const storyResponse = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        if (!storyResponse.ok) {
          console.error(`Failed to fetch story ${id}`);
          return null; // Skip if a single story fails
        }
        return storyResponse.json();
      });

      const stories = (await Promise.all(storyPromises)).filter(Boolean);

      if (stories.length === 0) {
        return 'I could not retrieve any top stories from Hacker News right now.';
      }

      const newsList = stories
        .map(
          (story: any, index: number) =>
            `${index + 1}. ${story.title} (Score: ${story.score})`
        )
        .join('\n');

      return `Here are the current top stories from Hacker News:\n${newsList}`;
    } catch (error) {
      console.error('Hacker News API error:', error);
      return 'Sorry, I encountered an error while trying to get the latest news.';
    }
  }
);
