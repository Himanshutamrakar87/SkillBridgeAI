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
    const { subject, topic, difficulty, count } = body;

    if (!subject || !topic) {
      return res.status(400).json({ error: 'Subject and topic are required.' });
    }

    const questionCount = Math.min(Math.max(Number(count) || 5, 3), 10);
    const ai = getGenAIClient();

    const prompt = `Generate a ${questionCount}-question multiple-choice quiz.
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty || 'Intermediate'}

Each question must have exactly 4 plausible options, only ONE correct answer (0-indexed: 0 for A, 1 for B, 2 for C, 3 for D), and a thorough explanation explaining why the correct choice is right and why others are incorrect.

Return the JSON matching the specified schema.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'You are an assessment specialist creating challenging, unambiguous, high-quality multiple-choice questions for students.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswerIndex: { type: Type.INTEGER, description: 'Index between 0 and 3' },
                  explanation: { type: Type.STRING },
                  coreConcept: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctAnswerIndex', 'explanation', 'coreConcept'],
              },
            },
          },
          required: ['quizTitle', 'subject', 'topic', 'difficulty', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Error in /api/quiz:', err);
    return res.status(500).json({
      error: formatErrorMessage(err),
    });
  }
}
