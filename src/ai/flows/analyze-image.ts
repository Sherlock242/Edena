'use server';

/**
 * @fileOverview A flow that analyzes an image and answers a question about it.
 *
 * - analyzeImage - A function that takes an image and a question and returns an answer.
 * - AnalyzeImageInput - The input type for the analyzeImage function.
 * - AnalyzeImageOutput - The return type for the analyzeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return analyzeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: {schema: AnalyzeImageInputSchema},
  output: {schema: AnalyzeImageOutputSchema},
  prompt: `You are Edena, an AI assistant with the ability to see and understand images.
Your response must be concise and directly answer the user's question about the image provided.

Question: {{{question}}}
Image: {{media url=image}}
`,
});

const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return { answer: output!.answer };
  }
);
