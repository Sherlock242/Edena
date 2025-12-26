'use server';
/**
 * @fileOverview A Genkit flow for cloning a voice and generating speech.
 * This flow analyzes the vocal characteristics of an audio sample and uses that
 * profile to guide the text-to-speech generation, simulating a voice clone.
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
    // Stage 1: Analyze the audio to create a vocal profile.
    // The AI "listens" to the audio and describes its characteristics.
    const { text: vocalProfile } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: [
            { media: { url: input.audioDataUri } },
            { text: `Analyze the provided audio. Do NOT transcribe the words. Instead, describe the speaker's vocal characteristics. Consider their pitch, pace, tone, and any notable style. Output a "Vocal Profile".` }
        ],
        config: { temperature: 0.3 },
    });

    if (!vocalProfile) {
        throw new Error("Could not analyze the provided audio sample to create a vocal profile.");
    }
    
    // Stage 2: Synthesize the new text using the generated vocal profile as guidance.
    const { media } = await ai.generate({
        model: 'googleai/gemini-1.5-flash-tts',
        prompt: `Text to speak: "${input.text}"\n\nVocal Profile Instructions: Generate the speech in a voice that matches the following profile: ${vocalProfile}`,
        config: {
            responseModalities: ['AUDIO'],
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
