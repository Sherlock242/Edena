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
import FormData from 'form-data';

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
async function tryImageAPI(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`API call failed with status: ${response.status} for URL: ${url}`);
          return null;
        }
        
        const imageBuffer = await response.buffer();
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        
        const base64Image = imageBuffer.toString('base64');
        return `data:${mimeType};base64,${base64Image}`;
    } catch (error) {
        console.error(`Error during API call to ${url}:`, error);
        return null;
    }
}

// Specific helper for DeepAI as it requires a POST request with an API key
async function tryDeepAI(prompt: string): Promise<string | null> {
  const apiKey = process.env.DEEPAI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn("DeepAI API key is not set. Skipping this backup.");
    return null;
  }

  try {
    const form = new FormData();
    form.append('text', prompt);

    const response = await fetch('https://api.deepai.org/api/text2img', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        ...form.getHeaders()
      },
      body: form
    });

    if (!response.ok) {
      console.error(`DeepAI API call failed with status: ${response.status}`);
      return null;
    }

    const data: any = await response.json();
    const imageUrl = data?.output_url;
    if (!imageUrl) {
      console.error("DeepAI API did not return a valid image URL.");
      return null;
    }

    // DeepAI returns a URL, so we fetch that URL to get the image data
    return await tryImageAPI(imageUrl);
    
  } catch (error) {
    console.error(`Error during DeepAI API call:`, error);
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
    let imageUrl = await tryImageAPI('https://image.pollinations.ai/prompt/' + encodeURIComponent(input.prompt));
    if (imageUrl) return { imageUrl };
    console.warn("Primary image generation failed, trying backup API 1...");

    // API 2: Backup (Unsplash Source)
    imageUrl = await tryImageAPI(`https://source.unsplash.com/512x512/?${encodeURIComponent(input.prompt)}`);
    if (imageUrl) return { imageUrl };
    console.warn("Backup API 1 failed, trying backup API 2 (DeepAI)...");

    // API 3: Backup (DeepAI)
    imageUrl = await tryDeepAI(input.prompt);
    if (imageUrl) return { imageUrl };
    console.warn("Backup API 2 (DeepAI) failed. All backups exhausted.");
    
    // If all fail, throw an error
    throw new Error('Failed to generate image from all available public APIs.');
  }
);
