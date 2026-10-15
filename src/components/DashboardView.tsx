import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Calendar,
  HelpCircle,
  Compass,
  ArrowRight,
  Clock,
  Brain,
  Layers,
  GraduationCap,
  History,
  Trash2,
  CheckCircle2,
  Award
} from 'lucide-react';
import { ActiveTab, SessionActivity } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  activities: SessionActivity[];
  onClearActivities: () => void;
  stats: {
    questionsAsked: number;
    plansCreated: number;
    conceptsExplored: number;
    quizzesCompleted: number;
  };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  activities,
  onClearActivities,
  stats,
}) => {
  const [selectedTechnique, setSelectedTechnique] = useState<'feynman' | 'spaced' | 'active_recall' | 'pomodoro'>('feynman');

  const techniques = {
    feynman: {
      name: 'The Feynman Technique',
      tag: 'Conceptual Mastery',
      steps: [
        'Choose a target concept and review its fundamentals.',
        'Explain it out loud or in writing as if teaching a 12-year-old with zero jargon.',
        'Pinpoint exact gaps where your explanation stalled or became vague.',
        'Review the source material to refine, simplify, and craft intuitive analogies.'
      ],
      bestFor: 'Complex physics, algorithms, data structures, and mathematics.'
    },
    spaced: {
      name: 'Spaced Repetition Protocol',
      tag: 'Long-Term Memory',
      steps: [
        'Review Day 1: Initial deep comprehension session.',
        'Review Day 3: Quick 10-minute self-test on core axioms without looking.',
        'Review Day 7: Solve 3 varied practice problems from memory.',
        'Review Day 14 & 30: Quick flash-review before semester exams.'
      ],
      bestFor: 'Definitions, formulas, system architectures, and syntax patterns.'
    },
    active_recall: {
      name: 'Active Recall Testing',
      tag: 'Knowledge Retrieval',
      steps: [
        'Close books, notes, and browser tabs before summarizing.',
        'Brain-dump every key formula, concept branch, and rule onto a blank sheet.',
        'Cross-examine against actual notes and highlight omitted items in color.',
        'Test yourself using the SkillBridge AI Quiz Lab.'
      ],
      bestFor: 'Exam preparation, technical interview drills, and viva quizzes.'
    },
    pomodoro: {
      name: 'Iterative 25/5 Deep Work',
      tag: 'Cognitive Focus',
      steps: [
        'Set a single atomic learning task (e.g. understand Dijkstra’s algorithm).',
        'Immerse in deep focus for 25 uninterrupted minutes (zero notifications).',
        'Take a strict 5-minute cognitive rest away from screens.',
        'Complete 4 cycles, then take a generous 20–30 minute recharge walk.'
      ],
      bestFor: 'Intense programming sessions, thesis drafting, and analytical problem-solving.'
    }
  };

  const featureCards = [
    {
      id: 'assistant' as ActiveTab,
      title: 'AI Learning Assistant',
      badge: 'Interactive Q&A',
      description: 'Ask deep educational questions, algorithmic logic, or mathematical proofs with step-by-step logic and code.',
      icon: Sparkles,
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      borderHover: 'hover:border-indigo-300 hover:shadow-indigo-500/5',
      badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200/80',
      cta: 'Start Question',
    },
    {
      id: 'planner' as ActiveTab,
      title: 'Smart Study Planner',
      badge: 'Curriculum Pacing',
      description: 'Input your subject syllabus and available hours to generate an actionable spaced-repetition study schedule.',
      icon: Calendar,
      iconBg: 'bg-sky-50 text-sky-600 border border-sky-100',
      borderHover: 'hover:border-sky-300 hover:shadow-sky-500/5',
      badgeColor: 'text-sky-700 bg-sky-50 border-sky-200/80',
      cta: 'Build Schedule',
    },
    {
      id: 'explainer' as ActiveTab,
      title: 'Concept Explainer',
      badge: 'Multi-Level Breakdown',
      description: 'Deconstruct complex topics with everyday analogies, formal academic definitions, and common traps to avoid.',
      icon: BookOpen,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      borderHover: 'hover:border-emerald-300 hover:shadow-emerald-500/5',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
      cta: 'Explore Concepts',
    },
    {
      id: 'quiz' as ActiveTab,
      title: 'Quiz Generator',
      badge: 'Self-Assessment',
      description: 'Generate customizable multiple-choice practice tests with instant local scoring, timer, and detailed answer rationale.',
      icon: HelpCircle,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      borderHover: 'hover:border-amber-300 hover:shadow-amber-500/5',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200/80',
      cta: 'Launch Quiz',
    },
    {
      id: 'career' as ActiveTab,
      title: 'Career & Skill Guidance',
      badge: 'Industry Alignment',
      description: 'Map out 6-month skill roadmaps, gap analysis, and hands-on portfolio projects for high-demand engineering careers.',
      icon: Compass,
      iconBg: 'bg-violet-50 text-violet-600 border border-violet-100',
      borderHover: 'hover:border-violet-300 hover:shadow-violet-500/5',
      badgeColor: 'text-violet-700 bg-violet-50 border-violet-200/80',
      cta: 'Explore Pathways',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Premium Light-Mode Hero Section */}
      <div className="relative rounded-2xl overflow-hidden border border-indigo-100 bg-gradient-to-br from-sky-50/80 via-indigo-50/50 to-purple-50/70 p-6 sm:p-8 lg:p-10 shadow-sm">
        {/* Soft decorative gradient glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/80 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide uppercase mb-4 shadow-2xs backdrop-blur-xs">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Intelligent Student Learning Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            SkillBridge <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700">AI</span>
          </h1>

          <p className="mt-2 text-lg sm:text-xl font-medium text-indigo-700 font-display">
            "Learn Smarter. Build Skills. Shape Your Future."
          </p>

          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            A comprehensive educational workspace designed for students to master difficult concepts, plan realistic study milestones, test knowledge retention, and receive personalized career guidance.
          </p>

          {/* Quick Action buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('assistant')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm hover:shadow-md shadow-indigo-500/25"
            >
              <Sparkles className="w-4 h-4 text-sky-200" />
              <span>Ask AI Mentor</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('quiz')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-2xs"
            >
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Take Practice Quiz</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('planner')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-2xs"
            >
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Create Study Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Session Activity Counters (Light Mode) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Questions Asked</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats.questionsAsked}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Current session chats</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Study Plans Built</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats.plansCreated}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Schedules generated</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Concepts Explored</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats.conceptsExplored}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Topic deep dives</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Quizzes Completed</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Award className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats.quizzesCompleted}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Tests evaluated</div>
        </div>
      </div>

      {/* 5 Core Feature Cards Grid (Light Mode) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Core Learning Modules</h2>
            <p className="text-xs text-slate-500">Select a tool to begin your study session</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`group flex flex-col justify-between p-5 rounded-xl border border-slate-200 bg-white ${card.borderHover} transition-all duration-200 shadow-2xs hover:shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors flex items-center gap-1">
                    {card.cta}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate(card.id)}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive High-Impact Study Technique Guide (Light Mode) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <h2 className="text-lg font-display font-bold text-slate-900 tracking-tight">
                Cognitive Study Techniques
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evidence-based methodologies used by top researchers and engineers
            </p>
          </div>

          {/* Technique Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
            {(['feynman', 'spaced', 'active_recall', 'pomodoro'] as const).map((tKey) => {
              const isActive = selectedTechnique === tKey;
              return (
                <button
                  key={tKey}
                  type="button"
                  onClick={() => setSelectedTechnique(tKey)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {techniques[tKey].name.split(' ')[1] || techniques[tKey].name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">
                {techniques[selectedTechnique].name}
              </h3>
              <span className="text-xs text-indigo-600 font-medium">
                · {techniques[selectedTechnique].tag}
              </span>
            </div>

            <ol className="space-y-2 mt-3">
              {techniques[selectedTechnique].steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Recommended For
              </span>
              <p className="mt-2 text-xs text-slate-700 leading-relaxed font-medium">
                {techniques[selectedTechnique].bestFor}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => onNavigate('assistant')}
                className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <span>Practice this in AI Mentor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Log (Light Mode) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Current Session Activity</h3>
          </div>
          {activities.length > 0 && (
            <button
              type="button"
              onClick={onClearActivities}
              className="text-xs text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Session</span>
            </button>
          )}
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No actions recorded in this session yet. Launch any module above to begin.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
            {activities.slice(0, 6).map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{item.title}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 shrink-0">
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
