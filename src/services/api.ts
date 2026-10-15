import {
  ConceptExplanation,
  QuizData,
  StudyPlanResponse,
  CareerGuidanceData,
} from '../types';

export interface HealthStatus {
  status: string;
  service: string;
  geminiConfigured: boolean;
  version: string;
  project: string;
}

async function requestJSON<T>(url: string, options: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (err: any) {
    throw new Error('Unable to connect to the SkillBridge AI server. Please check your network connection.');
  }

  let data: any;
  try {
    data = await response.json();
  } catch (parseErr) {
    throw new Error(`Server returned an invalid response (${response.status} ${response.statusText}).`);
  }

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status code ${response.status}.`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export async function checkServerHealth(): Promise<HealthStatus> {
  return requestJSON<HealthStatus>('/api/health', { method: 'GET' });
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: 'user' | 'model'; content: string }>
): Promise<{ reply: string }> {
  return requestJSON<{ reply: string }>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

export async function generateStudyPlan(params: {
  subject: string;
  topics: string;
  studyHoursPerDay: string;
  targetDate: string;
  currentLevel: string;
  extraPreferences?: string;
}): Promise<StudyPlanResponse> {
  return requestJSON<StudyPlanResponse>('/api/study-plan', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function explainConcept(params: {
  topic: string;
  level: string;
  style: string;
}): Promise<ConceptExplanation> {
  return requestJSON<ConceptExplanation>('/api/explain', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function generateQuiz(params: {
  subject: string;
  topic: string;
  difficulty: string;
  count: number;
}): Promise<QuizData> {
  return requestJSON<QuizData>('/api/quiz', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function generateCareerGuidance(params: {
  interests: string;
  currentSkills: string;
  targetRole: string;
  educationLevel: string;
}): Promise<CareerGuidanceData> {
  return requestJSON<CareerGuidanceData>('/api/career-guidance', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
