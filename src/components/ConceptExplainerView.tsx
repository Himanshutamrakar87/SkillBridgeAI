import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Eye,
  EyeOff,
  Code2,
  Loader2,
  Layers,
  RefreshCw
} from 'lucide-react';
import { ConceptExplanation } from '../types';
import { explainConcept } from '../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ConceptExplainerViewProps {
  onRecordActivity: (title: string, summary?: string) => void;
}

export const ConceptExplainerView: React.FC<ConceptExplainerViewProps> = ({ onRecordActivity }) => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [style, setStyle] = useState<'analogy' | 'rigorous' | 'engineering'>('analogy');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<ConceptExplanation | null>(null);
  const [showSelfTestAnswer, setShowSelfTestAnswer] = useState(false);

  const popularTopics = [
    'Recursion & The Call Stack',
    'Public-Key Cryptography (RSA)',
    'CAP Theorem in Distributed Systems',
    'Gradient Descent & Loss Functions',
    'B-Trees and Database Indexing',
    'Fourier Transform Intuition',
  ];

  const handleExplain = async (e?: React.FormEvent, customTopic?: string) => {
    if (e) e.preventDefault();
    const query = (customTopic || topic).trim();
    if (!query) {
      setErrorMessage('Please enter a concept or topic to deconstruct.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setShowSelfTestAnswer(false);

    try {
      const res = await explainConcept({
        topic: query,
        level: level,
        style: style,
      });

      setExplanation(res);
      onRecordActivity(`Explained: ${res.topic}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-emerald-600" />
            <span>Concept Explainer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Demystify complex academic and engineering concepts across three levels with analogies and real code
          </p>
        </div>

        {explanation && (
          <button
            type="button"
            onClick={() => setExplanation(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Concept</span>
          </button>
        )}
      </div>

      {/* Concept Search Form */}
      <form onSubmit={(e) => handleExplain(e)} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Enter Topic / Concept to Explain *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Dynamic Programming, TCP 3-Way Handshake, CRISPR, Eigenvalues..."
              required
              className="flex-1 rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm hover:shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Explaining...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-100" />
                  <span>Explain Concept</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Level and Pedagogical Style Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <span className="block text-xs font-semibold text-slate-500 mb-1.5">Target Difficulty</span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`py-1 text-xs font-medium rounded-md transition-colors ${
                    level === lvl
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 mb-1.5">Teaching Strategy</span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
              {[
                { id: 'analogy', label: 'Intuitive' },
                { id: 'rigorous', label: 'Theoretical' },
                { id: 'engineering', label: 'Systems' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id as any)}
                  className={`py-1 text-xs font-medium rounded-md transition-colors ${
                    style === s.id
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Suggested Quick Concepts */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 font-semibold block mb-2">
            Popular College & Engineering Concepts:
          </span>
          <div className="flex flex-wrap gap-2">
            {popularTopics.map((pt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTopic(pt);
                  handleExplain(undefined, pt);
                }}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-emerald-700 transition-colors shadow-2xs"
              >
                {pt}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMessage}
          </div>
        )}
      </form>

      {/* Explanation Result Presentation */}
      {explanation && (
        <div className="space-y-6">
          {/* Header Synopsis Card */}
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 p-6 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              <span>{level} Level Mastery</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 capitalize">{style} approach</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              {explanation.topic}
            </h2>
            <p className="text-base text-emerald-800 font-medium italic">
              "{explanation.tagline}"
            </p>
          </div>

          {/* Everyday Analogy Card */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-5 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span>Everyday Intuitive Analogy</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {explanation.intuitiveAnalogy}
            </p>
          </div>

          {/* Formal Definition & Core Principles */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Formal Academic Definition
              </span>
              <p className="text-sm text-slate-900 font-medium leading-relaxed bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                {explanation.formalDefinition}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Core Governing Principles
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {explanation.keyPrinciples.map((p, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-semibold text-slate-900">
                Step-by-Step Conceptual Progression
              </h3>
            </div>

            <div className="space-y-3">
              {explanation.stepByStepExplanation.map((step) => (
                <div key={step.stepNumber} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                    {step.stepNumber}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{step.heading}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {step.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code or Practical Architecture Example */}
          {explanation.codeOrPracticalExample && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>Code / Mathematical Implementation</span>
              </div>
              <MarkdownRenderer content={explanation.codeOrPracticalExample} />
            </div>
          )}

          {/* Common Traps & Summary Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Common Misconceptions & Exam Traps</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {explanation.commonPitfalls.map((pitfall, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold shrink-0">✕</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-violet-800 text-xs font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-violet-600" />
                <span>Executive Summary Takeaways</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {explanation.summaryPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-violet-600 font-bold shrink-0">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Self-Check Question */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-semibold text-slate-900">Instant Comprehension Check</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSelfTestAnswer(!showSelfTestAnswer)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-indigo-700 font-medium flex items-center gap-1.5 transition-colors"
              >
                {showSelfTestAnswer ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide Answer</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Reveal Answer</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm font-medium text-slate-800">
              {explanation.selfTest.question}
            </p>

            <div className="text-xs text-slate-500 italic">
              Hint: {explanation.selfTest.hint}
            </div>

            {showSelfTestAnswer && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 leading-relaxed">
                <span className="font-semibold text-emerald-800 block mb-1">Answer & Explanation:</span>
                {explanation.selfTest.answer}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
