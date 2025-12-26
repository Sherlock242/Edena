import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI} from 'genkitx-openai';

export const ai = genkit({
  plugins: [
    googleAI(),
    // Configure the OpenAI plugin for OpenRouter
    openAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
    }),
  ],
  // The default model remains Google's, the fallback logic will specify the OpenRouter model.
  model: 'google/gemini-flash-1.5',
});
