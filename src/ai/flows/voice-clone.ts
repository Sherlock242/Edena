'use server';
/**
 * @fileOverview A Genkit flow for cloning a voice and generating speech.
 * This is a placeholder and uses a standard text-to-speech voice.
 *
 * - cloneVoice - A function that takes an audio sample and text, and returns speech.
 * - CloneVoiceInput - The input type for the cloneVoice function.
 * - CloneVoiceOutput - The return type for the cloneVoice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const CloneVoiceInputSchema = z.object({
  audioDataUri: z.string().describe("The audio sample of the voice to be cloned, as a data URI."),
  text: z.string().describe('The text to be spoken in the cloned voice.'),
});
export type CloneVoiceInput = z.infer<typeof CloneVoiceInputSchema>;

const CloneVoiceOutputSchema = z.object({
  audioUrl: z.string().describe('The data URI of the generated audio.'),
});
export type CloneVoiceOutput = z.infer<typeof CloneVoiceOutputSchema>;

export async function cloneVoice(input: CloneVoiceInput): Promise<CloneVoiceOutput> {
  return cloneVoiceFlow(input);
}

// Helper function to convert PCM audio buffer to WAV base64 string
async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

const cloneVoiceFlow = ai.defineFlow(
  {
    name: 'cloneVoiceFlow',
    inputSchema: CloneVoiceInputSchema,
    outputSchema: CloneVoiceOutputSchema,
  },
  async (input) => {
    // !! IMPORTANT !!
    // This is a placeholder implementation. True real-time voice cloning is a
    // highly complex feature. This implementation uses a standard TTS voice
    // to simulate the functionality for UI and flow purposes.
    
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        prompt: input.text,
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
            },
        },
    });

    if (!media) {
      throw new Error("The AI model did not return any audio media.");
    }
    
    // The model returns raw PCM data, which needs to be wrapped in a WAV container to be playable.
    const pcmBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(pcmBuffer);

    return {
      audioUrl: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
