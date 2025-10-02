'use server';
/**
 * @fileOverview A Genkit tool for searching for movies, anime, and TV shows.
 *
 * - mediaSearchTool - A Genkit tool that takes a query and category and returns media info.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

const MediaSearchInputSchema = z.object({
  query: z.string().describe('The title of the movie, anime, or TV show to search for.'),
  category: z.enum(['movie', 'anime', 'tv']).describe('The category to search within.'),
});

export const mediaSearchTool = ai.defineTool(
  {
    name: 'mediaSearch',
    description:
      'Search for information about movies, anime, and TV shows.',
    inputSchema: MediaSearchInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const categoryMap = {
        movie: '1',
        tv: '2',
        anime: '4',
    }
    try {
      // Using the public API of a popular torrent aggregator which has extensive metadata.
      // We are only using it for metadata, not for any torrenting functionality.
      const response = await fetch(
        `https://apibay.org/q.php?q=${encodeURIComponent(
          input.query
        )}&cat=${categoryMap[input.category]}`
      );
      if (!response.ok) {
        return `I couldn't find any information for "${input.query}" in the ${input.category} category.`;
      }

      const data: any = await response.json();
      
      // The API returns "name":"0" for no results.
      if (data.length === 0 || data[0]?.name === "0") {
        return `No results found for "${input.query}" in the ${input.category} category.`;
      }

      const topResults = data.slice(0, 3); // Get top 3 results

      const mediaList = topResults
        .map(
          (media: any) =>
            `- "${media.name}" (Uploaded: ${new Date(media.added * 1000).toLocaleDateString()})`
        )
        .join('\n');

      return `Here are some results I found for the ${input.category} "${input.query}":\n${mediaList}`;
    } catch (error) {
      console.error('Media search API error:', error);
      return 'Sorry, I encountered an error while trying to search for media.';
    }
  }
);
