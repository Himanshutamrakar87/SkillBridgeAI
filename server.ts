import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

// Helper to get initialized GoogleGenAI client
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured. Please add your Gemini API key in the environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 0. Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    service: 'SkillBridge AI Engine',
    geminiConfigured: hasKey,
    version: '1.0.0',
    project: 'SkillBridge Student Platform'
  });
});

// A. AI Learning Assistant (Educational Chat)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Please provide a valid question or message.' });
      return;
    }
    if (message.length > 4000) {
      res.status(400).json({ error: 'Message exceeds the maximum limit of 4000 characters.' });
      return;
    }

    const ai = getGenAIClient();

    // Build chat contents including history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-8)) { // limit to last 8 turns to stay focused
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
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

    res.json({ reply: response.text || 'No response generated.' });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate explanation. Please verify your Gemini API key and try again.',
    });
  }
});

// B. Smart Study Planner
app.post('/api/study-plan', async (req: Request, res: Response) => {
  try {
    const { subject, topics, studyHoursPerDay, targetDate, currentLevel, extraPreferences } = req.body;
    if (!subject || !topics) {
      res.status(400).json({ error: 'Subject and topics are required.' });
      return;
    }

    const ai = getGenAIClient();

    const prompt = `Create a comprehensive, realistic, and practical study plan for a student.
Subject: ${subject}
Topics to Cover: ${topics}
Available Study Time: ${studyHoursPerDay || '2 hours/day'}
Target Completion / Exam Date: ${targetDate || 'in 3 weeks'}
Current Student Level: ${currentLevel || 'Intermediate'}
Special Focus / Notes: ${extraPreferences || 'None specified'}

Provide a structured, encouraging plan in JSON format matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert academic curriculum planner for engineering and university students. Build practical, realistic, spaced-repetition study plans with clear actionable milestones.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            estimatedTotalHours: { type: Type.NUMBER },
            dailyRecommendedHours: { type: Type.STRING },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING, description: 'e.g. Phase 1: Core Fundamentals' },
                  dayRange: { type: Type.STRING, description: 'e.g. Days 1–4' },
                  title: { type: Type.STRING },
                  objectives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  recommendedTechnique: { type: Type.STRING, description: 'e.g. Active Recall, Feynman Technique, Practice Problems' },
                  selfCheckGoal: { type: Type.STRING },
                },
                required: ['phase', 'dayRange', 'title', 'objectives', 'recommendedTechnique', 'selfCheckGoal'],
              },
            },
            retentionStrategies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            revisionCheckpoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['planTitle', 'summary', 'estimatedTotalHours', 'dailyRecommendedHours', 'milestones', 'retentionStrategies', 'revisionCheckpoints'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/study-plan:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate study plan. Please verify your Gemini API key.',
    });
  }
});

// C. Concept Explainer
app.post('/api/explain', async (req: Request, res: Response) => {
  try {
    const { topic, level, style } = req.body;
    if (!topic || typeof topic !== 'string') {
      res.status(400).json({ error: 'Topic is required.' });
      return;
    }

    const ai = getGenAIClient();

    const prompt = `Explain the educational concept "${topic.trim()}" in detail.
Target Level: ${level || 'Intermediate'} (Beginner: high school/introductory; Intermediate: undergraduate college student; Advanced: technical deep dive).
Pedagogical Style: ${style || 'balanced'} (Options: "analogy" focuses on everyday mental models, "rigorous" focuses on formal mathematical/theoretical formulation, "engineering" focuses on real-world systems and practical implementations).

Generate a structured JSON response matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/explain:', err);
    res.status(500).json({
      error: err.message || 'Failed to explain concept. Please verify your Gemini API key.',
    });
  }
});

// D. Quiz Generator
app.post('/api/quiz', async (req: Request, res: Response) => {
  try {
    const { subject, topic, difficulty, count } = req.body;
    if (!subject || !topic) {
      res.status(400).json({ error: 'Subject and topic are required.' });
      return;
    }

    const questionCount = Math.min(Math.max(Number(count) || 5, 3), 10);
    const ai = getGenAIClient();

    const prompt = `Generate a ${questionCount}-question multiple-choice quiz.
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty || 'Intermediate'}

Each question must have exactly 4 plausible options, only ONE correct answer (0-indexed: 0 for A, 1 for B, 2 for C, 3 for D), and a thorough explanation explaining why the correct choice is right and why others are incorrect.

Return the JSON matching the specified schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/quiz:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate quiz. Please verify your Gemini API key.',
    });
  }
});

// E. Career and Skill Guidance
app.post('/api/career-guidance', async (req: Request, res: Response) => {
  try {
    const { interests, currentSkills, targetRole, educationLevel } = req.body;
    if (!targetRole || !interests) {
      res.status(400).json({ error: 'Target role and interests are required.' });
      return;
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/career-guidance:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate career guidance. Please verify your Gemini API key.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function initServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SkillBridge AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
