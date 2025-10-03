'use server';
/**
 * @fileOverview A Genkit tool for fetching a random joke.
 *
 * - jokesTool - A Genkit tool that returns a random joke.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

export const jokesTool = ai.defineTool(
  {
    name: 'jokes',
    description: 'Tells a random joke, consisting of a setup and a punchline.',
    inputSchema: z.object({}), // No input needed
    outputSchema: z.string(),
  },
  async () => {
    try {
      const response = await fetch('https://official-joke-api.appspot.com/random_joke');
      if (!response.ok) {
        throw new Error('Failed to fetch a joke.');
      }
      const data: any = await response.json();

      if (!data.setup || !data.punchline) {
        return 'I seem to have forgotten the punchline to this one.';
      }

      // Return the joke formatted as a two-liner.
      return `${data.setup}\n${data.punchline}`;
    } catch (error) {
      console.error('Jokes API error:', error);
      return 'Sorry, I am unable to tell a joke right now.';
    }
  }
);
