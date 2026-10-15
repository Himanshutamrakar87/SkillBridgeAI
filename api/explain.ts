import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
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
    const { topic, level, style } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Concept topic is required.' });
    }

    const ai = getGenAIClient();

    const prompt = `Explain the educational concept "${topic.trim()}" in detail.
Target Level: ${level || 'Intermediate'} (Beginner: high school/introductory; Intermediate: undergraduate college student; Advanced: technical deep dive).
Pedagogical Style: ${style || 'balanced'} (Options: "analogy" focuses on everyday mental models, "rigorous" focuses on formal mathematical/theoretical formulation, "engineering" focuses on real-world systems and practical implementations).

Generate a structured JSON response matching the schema.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'You are an award-winning STEM professor and educational author. You make complex topics lucid, intuitive, and unforgettable.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            tagline: { type: Type.STRING, description: 'A memorable 1-sentence synopsis' },
            intuitiveAnalogy: { type: Type.STRING, description: 'An everyday relatable analogy' },
            formalDefinition: { type: Type.STRING, description: 'Accurate, precise academic definition' },
            keyPrinciples: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            stepByStepExplanation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.NUMBER },
                  heading: { type: Type.STRING },
                  details: { type: Type.STRING },
                },
                required: ['stepNumber', 'heading', 'details'],
              },
            },
            codeOrPracticalExample: { type: Type.STRING, description: 'Code snippet, formula, or real-world system architecture' },
            commonPitfalls: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            summaryPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            selfTest: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                hint: { type: Type.STRING },
                answer: { type: Type.STRING },
              },
              required: ['question', 'hint', 'answer'],
            },
          },
          required: [
            'topic',
            'tagline',
            'intuitiveAnalogy',
            'formalDefinition',
            'keyPrinciples',
            'stepByStepExplanation',
            'commonPitfalls',
            'summaryPoints',
            'selfTest',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Error in /api/explain:', err);
    return res.status(500).json({
      error: formatErrorMessage(err),
    });
  }
}
