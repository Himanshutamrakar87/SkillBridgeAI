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
    const { interests, currentSkills, targetRole, educationLevel } = body;

    if (!targetRole || !interests) {
      return res.status(400).json({ error: 'Target role and primary interests are required.' });
    }

    const ai = getGenAIClient();

    const prompt = `Provide actionable career and technical skill guidance for a student.
Target Career Role: ${targetRole}
Student Academic / Education Level: ${educationLevel || 'Undergraduate Engineering / Science'}
Primary Interests: ${interests}
Current Skills / Experience: ${currentSkills || 'Fundamental programming & coursework'}

Return structured career guidance in JSON format according to the schema.
Ensure the guidance includes concrete technical project ideas, priority skill gaps, learning roadmap, and industry certifications.
Important: Always include an educational guidance disclaimer stating this is AI advisory recommendations, not guaranteed employment.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: 'You are an engineering career counselor and industry mentor. Provide realistic, modern, high-value career path recommendations.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roleTitle: { type: Type.STRING },
            roleOverview: { type: Type.STRING },
            industryDemandTrends: { type: Type.STRING },
            skillGapAnalysis: {
              type: Type.OBJECT,
              properties: {
                mustHaveCoreSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recommendedToolsAndFrameworks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                vitalSoftSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['mustHaveCoreSkills', 'recommendedToolsAndFrameworks', 'vitalSoftSkills'],
            },
            learningRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING, description: 'e.g. Month 1-2: Foundations' },
                  focusArea: { type: Type.STRING },
                  learningMilestones: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  handsOnDeliverable: { type: Type.STRING },
                },
                required: ['phase', 'focusArea', 'learningMilestones', 'handsOnDeliverable'],
              },
            },
            portfolioProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  projectTitle: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  suggestedTechStack: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  resumeImpactHighlight: { type: Type.STRING },
                },
                required: ['projectTitle', 'difficulty', 'summary', 'suggestedTechStack', 'resumeImpactHighlight'],
              },
            },
            recommendedCertifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            guidanceDisclaimer: { type: Type.STRING },
          },
          required: [
            'roleTitle',
            'roleOverview',
            'industryDemandTrends',
            'skillGapAnalysis',
            'learningRoadmap',
            'portfolioProjects',
            'recommendedCertifications',
            'guidanceDisclaimer',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Error in /api/career-guidance:', err);
    return res.status(500).json({
      error: formatErrorMessage(err),
    });
  }
}
