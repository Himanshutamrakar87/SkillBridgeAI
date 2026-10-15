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
      if (parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE') {
        return 'The AI service is currently experiencing high demand. Please try again in a few moments.';
      }
      if (parsed.error.code === 429 || parsed.error.status === 'RESOURCE_EXHAUSTED') {
        return 'Rate limit reached. Please wait a moment before sending another request.';
      }
      return parsed.error.message;
    }
  } catch {
    // Not JSON, continue to string pattern checks
  }

  if (rawMessage.includes('503') || rawMessage.includes('UNAVAILABLE') || rawMessage.includes('high demand')) {
    return 'The AI service is currently experiencing high demand. Please try again in a few moments.';
  }

  if (rawMessage.includes('429') || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    return 'Rate limit reached. Please wait a moment before sending another request.';
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
  const models = ['gemini-3.8-flash', 'gemini-flash-latest'];

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
      const isTransient =
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('429');

      if (isTransient) {
        // Wait 600ms before attempting next model
        await new Promise((resolve) => setTimeout(resolve, 600));
        continue;
      }
      // Non-transient error, throw immediately
      throw err;
    }
  }

  throw lastError;
}
