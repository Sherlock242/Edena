'use server';
/**
 * @fileOverview A Genkit tool for searching YouTube.
 *
 * - youtubeTool - A Genkit tool that takes a search query and returns a list of YouTube videos.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

const YoutubeInputSchema = z.object({
  query: z.string().describe('The search query for YouTube videos.'),
});

export const youtubeTool = ai.defineTool(
  {
    name: 'youtube',
    description: 'Search for YouTube videos on a given topic.',
    inputSchema: YoutubeInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      // Using a public Invidious instance API to search YouTube without an API key
      const response = await fetch(
        `https://invidious.io.gg/api/v1/search?q=${encodeURIComponent(
          input.query
        )}`
      );

      if (!response.ok) {
        return `I couldn't find any YouTube videos matching "${input.query}".`;
      }

      const data: any = await response.json();
      
      // Filter out channels and playlists to only get videos
      const videos = data.filter((item: any) => item.type === 'video').slice(0, 5);

      if (videos.length === 0) {
        return `No YouTube videos found for "${input.query}".`;
      }

      const videoList = videos
        .map(
          (video: any) =>
            `- "${video.title}" by ${video.author} (Link: https://www.youtube.com/watch?v=${video.videoId})`
        )
        .join('\n');

      return `Here are some YouTube videos I found:\n${videoList}`;
    } catch (error) {
      console.error('YouTube search API error:', error);
      return 'Sorry, I encountered an error while trying to search YouTube.';
    }
  }
);
