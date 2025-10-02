'use server';
/**
 * @fileOverview A Genkit tool for fetching weather information.
 *
 * - weatherTool - A Genkit tool that takes a location and returns the current weather.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fetch from 'node-fetch';

const WeatherInputSchema = z.object({
  location: z
    .string()
    .describe(
      'The city name for which to get the weather. e.g., "San Francisco"'
    ),
});

// Helper function to get coordinates for a location
async function getCoordinates(location: string) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      location
    )}&count=1`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch coordinates.');
  }
  const data: any = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`Could not find coordinates for "${location}".`);
  }
  const {latitude, longitude, name, admin1, country} = data.results[0];
  return {latitude, longitude, name: `${name}, ${admin1 || country}`};
}

export const weatherTool = ai.defineTool(
  {
    name: 'weather',
    description: 'Get the current weather for a specific location.',
    inputSchema: WeatherInputSchema,
    outputSchema: z.string(),
  },
  async input => {
    try {
      const {latitude, longitude, name} = await getCoordinates(input.location);
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data.');
      }
      const weatherData: any = await weatherResponse.json();
      const temp = weatherData.current_weather.temperature;
      const unit = weatherData.daily_units?.temperature_2m_max || '°C';
      return `The current temperature in ${name} is ${temp}${unit}.`;
    } catch (error: any) {
      console.error('Weather tool error:', error);
      return (
        error.message ||
        'Sorry, I encountered an error while trying to get the weather.'
      );
    }
  }
);
