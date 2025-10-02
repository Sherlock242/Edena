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
  async input => {
    // Switching to a more accessible public model for image generation.
    const {media} = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: `Generate a high-quality, photorealistic image based on the following description: ${input.prompt}`,
       config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media.url) {
      throw new Error('Image generation failed to produce an image.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
