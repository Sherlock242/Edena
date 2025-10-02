'use server';
/**
 * @fileOverview A Genkit tool for fetching word definitions from a dictionary API.
 *
 * - dictionaryTool - A Genkit tool that takes a word and returns its definition.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fetch from 'node-fetch';

const DictionaryInputSchema = z.object({
  word: z.string().describe('The word to look up in the dictionary.'),
});

export const dictionaryTool = ai.defineTool(
  {
    name: 'dictionary',
    description: 'Get the definition of a word.',
    inputSchema: DictionaryInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${input.word}`
      );
      if (!response.ok) {
        return `I couldn't find a definition for "${input.word}". Please check the spelling.`;
      }
      const data: any = await response.json();
      const firstMeaning = data[0]?.meanings[0];
      if (!firstMeaning) {
        return `No definitions found for "${input.word}".`;
      }
      const definition = firstMeaning.definitions[0]?.definition;
      const example = firstMeaning.definitions[0]?.example;
      let result = `Definition of ${input.word}: ${definition}`;
      if (example) {
        result += `\nExample: "${example}"`;
      }
      return result;
    } catch (error) {
      console.error('Dictionary API error:', error);
      return 'Sorry, I encountered an error while trying to access the dictionary.';
    }
  }
);
