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

// Function to try fetching from a given URL and return a data URI
async function tryImageAPI(url: string, isBackup: boolean = false): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`API call failed with status: ${response.status} for URL: ${url}`);
          return null;
        }
        
        let imageBuffer, mimeType;
        if (isBackup) {
          // The backup API returns a JSON with the image data
          const data: any = await response.json();
          const imageUrl = data?.data?.[0]?.url;
          if (!imageUrl) {
            console.error("Backup API did not return a valid image URL.");
            return null;
          }
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            console.error(`Backup image download failed with status: ${imageResponse.status}`);
            return null;
          }
          imageBuffer = await imageResponse.buffer();
          mimeType = imageResponse.headers.get('content-type') || 'image/png';
        } else {
          // The primary API returns the image directly
          imageBuffer = await response.buffer();
          mimeType = response.headers.get('content-type') || 'image/jpeg';
        }

        const base64Image = imageBuffer.toString('base64');
        return `data:${mimeType};base64,${base64Image}`;
    } catch (error) {
        console.error(`Error during API call to ${url}:`, error);
        return null;
    }
}


const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    // API 1: Primary (Pollinations.ai)
    const primaryApiUrl = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(input.prompt);
    let imageUrl = await tryImageAPI(primaryApiUrl);

    // API 2: Backup (Canva)
    if (!imageUrl) {
        console.warn("Primary image generation failed, trying backup API...");
        const backupApiUrl = `https://image.canva.com/v1/sticker-search?query=${encodeURIComponent(input.prompt)}&width=512&height=512&format=png`;
        imageUrl = await tryImageAPI(backupApiUrl, true);
    }
    
    if (imageUrl) {
      return { imageUrl };
    }

    // If both fail, throw an error
    throw new Error('Failed to generate image from all available public APIs.');
  }
);
