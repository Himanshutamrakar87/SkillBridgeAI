import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AIAssistantView } from './components/AIAssistantView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { ConceptExplainerView } from './components/ConceptExplainerView';
import { QuizGeneratorView } from './components/QuizGeneratorView';
import { CareerGuidanceView } from './components/CareerGuidanceView';
import { ActiveTab, SessionActivity } from './types';
import { checkServerHealth } from './services/api';
import { GraduationCap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [geminiConnected, setGeminiConnected] = useState<boolean>(true);
  const [activities, setActivities] = useState<SessionActivity[]>(() => {
    try {
      const saved = localStorage.getItem('skillbridge_activities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('skillbridge_stats');
      return saved
        ? JSON.parse(saved)
        : {
            questionsAsked: 0,
            plansCreated: 0,
            conceptsExplored: 0,
            quizzesCompleted: 0,
          };
    } catch {
      return {
        questionsAsked: 0,
        plansCreated: 0,
        conceptsExplored: 0,
        quizzesCompleted: 0,
      };
    }
  });

  // Verify backend health on startup
  useEffect(() => {
    let isMounted = true;
    checkServerHealth()
      .then((res) => {
        if (isMounted) {
          setGeminiConnected(res.geminiConfigured);
        }
      })
      .catch((err) => {
        console.warn('Health check warning:', err.message);
        if (isMounted) {
          setGeminiConnected(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync session state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('skillbridge_activities', JSON.stringify(activities));
      localStorage.setItem('skillbridge_stats', JSON.stringify(stats));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [activities, stats]);

  const recordActivity = (title: string, summary?: string) => {
    const newActivity: SessionActivity = {
      id: `act-${Date.now()}`,
      type:
        activeTab === 'assistant'
          ? 'question'
          : activeTab === 'planner'
          ? 'plan'
          : activeTab === 'explainer'
          ? 'concept'
          : activeTab === 'quiz'
          ? 'quiz'
          : 'career',
      title,
      summary,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActivities((prev) => [newActivity, ...prev.slice(0, 19)]);

    setStats((prev: typeof stats) => {
      if (activeTab === 'assistant') {
        return { ...prev, questionsAsked: prev.questionsAsked + 1 };
      } else if (activeTab === 'planner') {
        return { ...prev, plansCreated: prev.plansCreated + 1 };
      } else if (activeTab === 'explainer') {
        return { ...prev, conceptsExplored: prev.conceptsExplored + 1 };
      }
      return prev;
    });
  };

  const incrementQuizzesCompleted = () => {
    setStats((prev: typeof stats) => ({
      ...prev,
      quizzesCompleted: prev.quizzesCompleted + 1,
    }));
  };

  const handleClearActivities = () => {
    setActivities([]);
    try {
      localStorage.removeItem('skillbridge_activities');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Top Navbar adhering to the Top Bar contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        geminiConnected={geminiConnected}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            activities={activities}
            onClearActivities={handleClearActivities}
            stats={stats}
          />
        )}

        {activeTab === 'assistant' && (
          <AIAssistantView onRecordActivity={recordActivity} />
        )}

        {activeTab === 'planner' && (
          <StudyPlannerView onRecordActivity={recordActivity} />
        )}

        {activeTab === 'explainer' && (
          <ConceptExplainerView onRecordActivity={recordActivity} />
        )}

        {activeTab === 'quiz' && (
          <QuizGeneratorView
            onRecordActivity={recordActivity}
            onIncrementQuizzesCompleted={incrementQuizzesCompleted}
          />
        )}

        {activeTab === 'career' && (
          <CareerGuidanceView onRecordActivity={recordActivity} />
        )}
      </main>

      {/* Clean Educational Project Footer in Light Mode */}
      <footer className="border-t border-slate-200/90 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold shadow-2xs">
              SB
            </div>
            <span className="font-display font-semibold text-slate-800">
              SkillBridge AI
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">
              "Learn Smarter. Build Skills. Shape Your Future."
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Smart Education Platform</span>
            </span>
            <span>·</span>
            <span>Empowering Student Success</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
