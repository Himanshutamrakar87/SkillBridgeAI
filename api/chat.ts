import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGenAIClient, parseRequestBody, generateWithFallback, formatErrorMessage } from './_lib/gemini.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = parseRequestBody(req);
    const { message, history } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a valid question or message.' });
    }

    if (message.length > 4000) {
      return res.status(400).json({ error: 'Message exceeds the maximum limit of 4000 characters.' });
    }

    const ai = getGenAIClient();

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-8)) {
        if (item && (item.role === 'user' || item.role === 'model') && typeof item.content === 'string') {
          contents.push({
            role: item.role,
            parts: [{ text: item.content.slice(0, 2000) }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    const response = await generateWithFallback(ai, {
      contents,
      config: {
        systemInstruction: `You are SkillBridge AI's dedicated educational mentor for college and university students.
Your role:
- Explain academic, technical, engineering, and scientific concepts with crystal clarity.
- Structure your response using markdown with clear headings, bullet points, and code blocks (with language specified) when relevant.
- When explaining formulas or algorithms, break them down step-by-step.
- Provide practical examples and intuitive analogies.
- Be encouraging, concise, rigorous, and student-focused.
- If relevant, include a quick "Key Takeaway" or "Pro Tip" at the end.`,
        temperature: 0.7,
      },
    });

    return res.status(200).json({ reply: response.text || 'No response generated.' });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return res.status(500).json({
      error: formatErrorMessage(err),
    });
  }
}
