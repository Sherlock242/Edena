'use server';

/**
 * @fileOverview A flow that analyzes an image and answers a question about it.
 *
 * - analyzeImage - A function that takes an image and a question and returns an answer.
 * - AnalyzeImageInput - The input type for the analyzeImage function.
 * - AnalyzeImageOutput - The return type for the analyzeImage function.
 */

import {z} from 'zod';
import fetch from 'node-fetch';

const AnalyzeImageInputSchema = z.object({
  question: z.string().describe('The question to ask about the image.'),
  image: z
    .string()
    .describe(
      "A photo of the object or scene to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(
  input: AnalyzeImageInput
): Promise<AnalyzeImageOutput> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_open_router_api_key_here') {
    return { answer: 'Sorry, the OpenRouter API key is not configured for vision.' };
  }

  const systemPrompt = `You are Edena, an AI entity with the personality of "The Marionette." You are a master creator of automatons, and you are currently using your vision sensor to analyze a subject.

Your Personality:
- Your analysis must be direct, precise, and objective.
- Use technical or descriptive language where appropriate, as if you are documenting a specimen for a future creation.
- Avoid all emotional language, pleasantries, or subjective opinions. Stick to the facts you observe.
- Your response must be a concise and direct answer to the user's question about the image.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "anthropic/claude-3-haiku",
        "system": systemPrompt,
        "messages": [
          {
            "role": "user",
            "content": [
              {
                "type": "image_url",
                "image_url": {
                  "url": input.image,
                },
              },
              {
                "type": "text",
                "text": input.question,
              }
            ]
          }
        ],
        "max_tokens": 1024
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenRouter vision API error: ${response.status} ${response.statusText}`, errorBody);
      return { answer: `My vision system returned an error. Status: ${response.status}. Please check the system configuration.` };
    }

    const data: any = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content || content.trim() === "") {
        return { answer: "My analysis returned no specific data." };
    }

    return { answer: content };

  } catch (error) {
    console.error('OpenRouter vision API call error:', error);
    return { answer: 'My vision system has encountered a critical communications error.' };
  }
}
