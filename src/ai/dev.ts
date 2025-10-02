import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-related-concepts.ts';
import '@/ai/flows/search.ts';
import '@/ai/tools/books.ts';
import '@/ai/tools/news.ts';
import '@/ai/tools/youtube.ts';
import '@/ai/tools/ddg-search.ts';
import '@/ai/tools/articles.ts';
import '@/ai/tools/cricket.ts';
import '@/ai/tools/media-search.ts';
import '@/ai/tools/space-news.ts';
import '@/ai/tools/snexengine.ts';
import '@/ai/prefixes.ts';
