'use server';

/**
 * @fileOverview A flow that generates an image from a text prompt.
 *
 * - generateImage - A function that takes a prompt and returns an image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fetch from 'node-fetch';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt for image generation.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(
  input: GenerateImageInput
): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    try {
      // Using a public, non-Google, free image generation API.
      const response = await fetch('https://image.pollinations.ai/prompt/' + encodeURIComponent(input.prompt));

      if (!response.ok) {
        throw new Error(`Image generation failed with status: ${response.status}`);
      }

      const imageBuffer = await response.buffer();
      const base64Image = imageBuffer.toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/jpeg';
      const imageUrl = `data:${mimeType};base64,${base64Image}`;

      return {
        imageUrl: imageUrl,
      };
    } catch (error) {
       console.error("Image generation error:", error);
       throw new Error('Failed to generate image from the public API.');
    }
  }
);
