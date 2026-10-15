export type ActiveTab = 'dashboard' | 'assistant' | 'planner' | 'explainer' | 'quiz' | 'career';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface StudyPlanMilestone {
  phase: string;
  dayRange: string;
  title: string;
  objectives: string[];
  recommendedTechnique: string;
  selfCheckGoal: string;
  completed?: boolean;
}

export interface StudyPlanResponse {
  planTitle: string;
  summary: string;
  estimatedTotalHours: number;
  dailyRecommendedHours: string;
  milestones: StudyPlanMilestone[];
  retentionStrategies: string[];
  revisionCheckpoints: string[];
}

export interface ConceptStep {
  stepNumber: number;
  heading: string;
  details: string;
}

export interface ConceptExplanation {
  topic: string;
  tagline: string;
  intuitiveAnalogy: string;
  formalDefinition: string;
  keyPrinciples: string[];
  stepByStepExplanation: ConceptStep[];
  codeOrPracticalExample?: string;
  commonPitfalls: string[];
  summaryPoints: string[];
  selfTest: {
    question: string;
    hint: string;
    answer: string;
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  coreConcept: string;
}

export interface QuizData {
  quizTitle: string;
  subject: string;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface CareerProject {
  projectTitle: string;
  difficulty: string;
  summary: string;
  suggestedTechStack: string[];
  resumeImpactHighlight: string;
}

export interface CareerRoadmapPhase {
  phase: string;
  focusArea: string;
  learningMilestones: string[];
  handsOnDeliverable: string;
}

export interface CareerGuidanceData {
  roleTitle: string;
  roleOverview: string;
  industryDemandTrends: string;
  skillGapAnalysis: {
    mustHaveCoreSkills: string[];
    recommendedToolsAndFrameworks: string[];
    vitalSoftSkills: string[];
  };
  learningRoadmap: CareerRoadmapPhase[];
  portfolioProjects: CareerProject[];
  recommendedCertifications: string[];
  guidanceDisclaimer: string;
}

export interface SessionActivity {
  id: string;
  type: 'question' | 'plan' | 'concept' | 'quiz' | 'career';
  title: string;
  timestamp: string;
  summary?: string;
}
