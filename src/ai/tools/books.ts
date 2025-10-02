'use server';
/**
 * @fileOverview A Genkit tool for searching for books using the Open Library API.
 *
 * - booksTool - A Genkit tool that takes a search query and returns book information.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

const BooksInputSchema = z.object({
  query: z.string().describe('The title or author of the book to search for.'),
});

export const booksTool = ai.defineTool(
  {
    name: 'books',
    description:
      'Search for books by title or author to get a list of matching books.',
    inputSchema: BooksInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          input.query
        )}`
      );
      if (!response.ok) {
        return `I couldn't find any books matching "${input.query}".`;
      }
      const data: any = await response.json();
      const books = data.docs.slice(0, 5); // Get top 5 results

      if (books.length === 0) {
        return `No books found for "${input.query}".`;
      }

      const bookList = books
        .map(
          (book: any) =>
            `- "${book.title}" by ${
              book.author_name ? book.author_name.join(', ') : 'Unknown Author'
            } (First published: ${book.first_publish_year || 'N/A'})`
        )
        .join('\n');

      return `Here are some books I found:\n${bookList}`;
    } catch (error) {
      console.error('Open Library API error:', error);
      return 'Sorry, I encountered an error while trying to search for books.';
    }
  }
);
