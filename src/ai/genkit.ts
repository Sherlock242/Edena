import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // The default model is Google's Gemini 1.5 Flash.
  model: 'googleai/gemini-1.5-flash-latest',
});
