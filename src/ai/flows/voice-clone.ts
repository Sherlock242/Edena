'use server';
/**
 * @fileOverview A Genkit flow for cloning a voice and generating speech.
 * This flow simulates voice cloning by transcribing an audio sample, analyzing
 * the transcription to create a vocal profile, and then using that profile
 * to guide the text-to-speech generation.
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
  transcribedText: z.string().optional().describe('The text transcribed from the audio sample.'),
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
    // Stage 1: Transcribe the audio to give the AI "ears".
    // This uses a model specialized for audio processing.
    const { text: transcribedText } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [{ media: { url: input.audioDataUri } }, {text: 'Transcribe this audio.'}],
    });

    if (!transcribedText) {
        throw new Error("Could not understand the provided audio sample.");
    }
    
    // Stage 2: Analyze the transcribed text to create a vocal profile.
    const { text: vocalProfile } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: `Analyze the following text transcription to create a vocal profile. Describe the likely tone, pace, and style of the speaker. Be descriptive and creative.
        Transcription: "${transcribedText}"
        Vocal Profile:`,
        config: { temperature: 0.7 },
    });
    
    // Stage 3: Synthesize the new text using the generated vocal profile as guidance.
    const { media } = await ai.generate({
        model: 'googleai/gemini-1.5-flash-tts',
        prompt: `Text to speak: "${input.text}"
        Vocal Profile Instructions: Generate the speech in a voice that matches the following profile: ${vocalProfile}`,
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
      transcribedText: transcribedText,
    };
  }
);
