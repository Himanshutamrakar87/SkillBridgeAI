import { GoogleGenAI } from '@google/genai';

export function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured. Please set your Gemini API key in Vercel environment variables.');
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function parseRequestBody(req: any): any {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export function formatErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred while communicating with the AI service.';

  const rawMessage = typeof err.message === 'string' ? err.message : String(err);

  // Check if rawMessage is a stringified JSON error from Google GenAI
  try {
    const parsed = JSON.parse(rawMessage);
    if (parsed.error?.message) {
      const msg = parsed.error.message;
      if (parsed.error.code === 429 || parsed.error.status === 'RESOURCE_EXHAUSTED' || msg.includes('quota') || msg.includes('rate-limits')) {
        return 'Rate limit or free-tier quota exceeded for your Gemini API key. Please check your Google AI Studio plan or retry shortly.';
      }
      if (parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE' || msg.includes('high demand') || msg.includes('overloaded')) {
        return 'The AI service is experiencing high temporary demand across Google servers. Please try again in a few moments.';
      }
      if (parsed.error.code === 400 && (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid'))) {
        return 'Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable in Vercel.';
      }
      return msg;
    }
  } catch {
    // Not JSON, continue to string pattern checks
  }

  if (rawMessage.includes('quota') || rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('rate-limits')) {
    return 'Rate limit or free-tier quota exceeded for your Gemini API key. Please check your Google AI Studio plan or retry shortly.';
  }

  if (rawMessage.includes('503') || rawMessage.includes('UNAVAILABLE') || rawMessage.includes('high demand') || rawMessage.includes('overloaded')) {
    return 'The AI service is currently experiencing high demand. Please try again in a few moments.';
  }

  if (rawMessage.includes('API_KEY_INVALID') || rawMessage.includes('API key not valid')) {
    return 'Invalid Gemini API key. Please verify GEMINI_API_KEY in your Vercel Project Settings > Environment Variables.';
  }

  if (rawMessage.includes('GEMINI_API_KEY is not configured')) {
    return 'GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your Vercel Project Settings > Environment Variables.';
  }

  return rawMessage;
}

export async function generateWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
) {
  // Ordered sequence of production-ready Gemini models:
  // Starts with high-throughput, low-latency models with high daily free-tier quotas,
  // automatically falling back if one experiences 503 high demand or 429 quota exhaustion.
  const models = [
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-3.8-flash',
  ];

  let lastError: any = null;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[SkillBridge AI] Model ${model} encountered an issue: ${errMsg.slice(0, 120)}. Trying fallback model...`);

      const isTransient =
        errMsg.includes('503') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand') ||
        errMsg.includes('overloaded') ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('quota') ||
        errMsg.includes('404') ||
        errMsg.includes('not found');

      if (isTransient) {
        // Brief pause before trying next fallback model
        await new Promise((resolve) => setTimeout(resolve, 300));
        continue;
      }

      // If it's a fatal non-transient error (e.g. invalid auth), throw immediately
      throw err;
    }
  }

  throw lastError;
}
