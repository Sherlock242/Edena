'use server';
/**
 * @fileOverview A Genkit tool for performing a general-purpose search using the OpenRouter API.
 *
 * - openRouterSearchTool - A Genkit tool that takes a search query and uses OpenRouter to get an answer.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

const SearchInputSchema = z.object({
  query: z.string().describe('The search query for the web search.'),
});

export const openRouterSearchTool = ai.defineTool(
  {
    name: 'openRouterSearch',
    description: 'Uses OpenRouter to answer general questions as a fallback search.',
    inputSchema: SearchInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_open_router_api_key_here') {
      return 'Sorry, the OpenRouter API key is not configured.';
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "mistralai/mistral-7b-instruct-v0.2",
          "messages": [
            { "role": "system", "content": "You are a helpful search assistant. Provide a concise and direct answer to the user's query." },
            { "role": "user", "content": input.query }
          ]
        })
      });

      if (!response.ok) {
          const errorBody = await response.text();
          console.error(`OpenRouter API error: ${response.status} ${response.statusText}`, errorBody);
          return `I couldn't perform a search with OpenRouter. Status: ${response.status}`;
      }

      const data: any = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content || content.trim() === "") {
        return `OpenRouter returned an empty response for "${input.query}".`;
      }

      return content;

    } catch (error) {
      console.error('OpenRouter API error:', error);
      return 'Sorry, I encountered an error while trying to perform a search with OpenRouter.';
    }
  }
);
