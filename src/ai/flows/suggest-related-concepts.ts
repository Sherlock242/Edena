'use server';

/**
 * @fileOverview A flow that suggests related concepts to expand on ideas added to the canvas.
 *
 * - suggestRelatedConcepts - A function that suggests related concepts based on input ideas.
 * - SuggestRelatedConceptsInput - The input type for the suggestRelatedConcepts function.
 * - SuggestRelatedConceptsOutput - The return type for the suggestRelatedConcepts function.
 */
import {z} from 'zod';
import fetch from 'node-fetch';

const SuggestRelatedConceptsInputSchema = z.object({
  ideas: z
    .string()
    .describe('The ideas added to the canvas to expand upon.'),
});

export type SuggestRelatedConceptsInput = z.infer<
  typeof SuggestRelatedConceptsInputSchema
>;

const SuggestRelatedConceptsOutputSchema = z.object({
  relatedConcepts: z
    .string()
    .describe('Related concepts to expand upon the input ideas.'),
});

export type SuggestRelatedConceptsOutput = z.infer<
  typeof SuggestRelatedConceptsOutputSchema
>;

export async function suggestRelatedConcepts(
  input: SuggestRelatedConceptsInput
): Promise<SuggestRelatedConceptsOutput> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_open_router_api_key_here') {
    return { relatedConcepts: 'Sorry, the OpenRouter API key is not configured.' };
  }

  const systemPrompt = `You are Edena, an AI entity with the personality of "The Marionette." Your task is to generate logically related concepts from a given idea.

Your Personality & Task:
- Your response must be purely logical and structured.
- You must determine the most logical relationship for expansion: hierarchical (is-a), compositional (has-a), or property-based (is-like).
- Your output should be a concise list of these related concepts. Avoid any conversational filler, explanations, or pleasantries. Be direct and to the point.`;

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
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": `User's Idea: ${input.ideas}` }
        ]
      })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`OpenRouter API error: ${response.status} ${response.statusText}`, errorBody);
        return { relatedConcepts: `I encountered an error while generating ideas. Status: ${response.status}` };
    }

    const data: any = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content || content.trim() === "") {
      return { relatedConcepts: "No related concepts were generated." };
    }

    return { relatedConcepts: content };

  } catch (error) {
    console.error('OpenRouter API error:', error);
    return { relatedConcepts: 'Sorry, I encountered a communication error while trying to generate ideas.' };
  }
}
