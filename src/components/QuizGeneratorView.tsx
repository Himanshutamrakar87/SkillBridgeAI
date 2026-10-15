import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Flag,
  Loader2,
  AlertCircle,
  Check,
  RefreshCw
} from 'lucide-react';
import { QuizData, QuizQuestion } from '../types';
import { generateQuiz } from '../services/api';

interface QuizGeneratorViewProps {
  onRecordActivity: (title: string, summary?: string) => void;
  onIncrementQuizzesCompleted: () => void;
}

export const QuizGeneratorView: React.FC<QuizGeneratorViewProps> = ({
  onRecordActivity,
  onIncrementQuizzesCompleted,
}) => {
  // Setup state
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active quiz state
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Starter templates
  const starterTemplates = [
    { subject: 'Computer Science', topic: 'Data Structures - Trees & Hash Tables', difficulty: 'Intermediate', count: 5 },
    { subject: 'Operating Systems', topic: 'Processes, Threads & Synchronization', difficulty: 'Intermediate', count: 5 },
    { subject: 'Software Engineering', topic: 'Agile, Design Patterns & Architecture', difficulty: 'Beginner', count: 5 },
    { subject: 'Mathematics', topic: 'Linear Algebra - Matrices & Eigenvectors', difficulty: 'Advanced', count: 5 },
  ];

  // Timer for active quiz
  useEffect(() => {
    let interval: any;
    if (quizData && !isSubmitted) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizData, isSubmitted]);

  const handleGenerate = async (e?: React.FormEvent, customData?: typeof starterTemplates[0]) => {
    if (e) e.preventDefault();
    const finalSubject = (customData?.subject || subject).trim();
    const finalTopic = (customData?.topic || topic).trim();
    const finalDiff = customData?.difficulty as any || difficulty;
    const finalCount = customData?.count || questionCount;

    if (!finalSubject || !finalTopic) {
      setErrorMessage('Please specify both a subject and a topic.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setQuizData(null);
    setUserAnswers({});
    setFlaggedQuestions({});
    setIsSubmitted(false);
    setCurrentIndex(0);
    setElapsedSeconds(0);

    try {
      const res = await generateQuiz({
        subject: finalSubject,
        topic: finalTopic,
        difficulty: finalDiff,
        count: finalCount,
      });

      if (!res.questions || res.questions.length === 0) {
        throw new Error('No quiz questions were returned. Please try another topic.');
      }

      setQuizData(res);
      onRecordActivity(`Quiz: ${res.topic} (${res.questions.length} questions)`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectAnswer = (questionIdx: number, optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const toggleFlag = (questionIdx: number) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionIdx]: !prev[questionIdx],
    }));
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    onIncrementQuizzesCompleted();
  };

  const handleRetake = () => {
    setUserAnswers({});
    setFlaggedQuestions({});
    setIsSubmitted(false);
    setCurrentIndex(0);
    setElapsedSeconds(0);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const calculateScore = () => {
    if (!quizData) return { correct: 0, total: 0, percent: 0 };
    let correct = 0;
    quizData.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        correct++;
      }
    });
    const total = quizData.questions.length;
    const percent = Math.round((correct / total) * 100);
    return { correct, total, percent };
  };

  const currentQ = quizData?.questions[currentIndex];
  const { correct, total, percent } = calculateScore();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 flex items-center gap-2.5">
            <HelpCircle className="w-7 h-7 text-amber-600" />
            <span>AI Practice Quiz Lab</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Custom multiple-choice questions with instant client-side grading, time tracking, and detailed explanations
          </p>
        </div>

        {quizData && (
          <button
            type="button"
            onClick={() => {
              setQuizData(null);
              setIsSubmitted(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New Quiz</span>
          </button>
        )}
      </div>

      {/* Setup Form if no quiz active */}
      {!quizData && (
        <div className="space-y-6">
          <form onSubmit={(e) => handleGenerate(e)} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Subject / Discipline *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Computer Science, Physics, Electrical"
                  required
                  className="w-full rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Specific Topic / Module *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Binary Search Trees & AVL rotations"
                  required
                  className="w-full rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                        difficulty === lvl
                          ? 'bg-amber-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
                  {[3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                        questionCount === num
                          ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {num} Questions
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !subject.trim() || !topic.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Questions & Answer Key...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-100" />
                    <span>Generate Practice Quiz</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Starter Presets */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              Or Launch a Ready-Made Topic Quiz:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {starterTemplates.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSubject(template.subject);
                    setTopic(template.topic);
                    setDifficulty(template.difficulty as any);
                    setQuestionCount(template.count);
                    handleGenerate(undefined, template);
                  }}
                  className="text-left p-3 rounded-xl bg-slate-50/70 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 transition-colors text-xs space-y-1 shadow-2xs"
                >
                  <div className="font-semibold text-slate-900 flex items-center justify-between">
                    <span>{template.topic}</span>
                    <span className="text-[10px] text-amber-700 font-semibold">{template.difficulty}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{template.subject} · {template.count} Questions</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Quiz View */}
      {quizData && !isSubmitted && currentQ && (
        <div className="space-y-6">
          {/* Top Bar for Quiz */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-amber-50/60 via-white to-indigo-50/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-amber-700">{quizData.subject}</span>
                <span>·</span>
                <span>{quizData.topic}</span>
                <span>·</span>
                <span className="capitalize">{quizData.difficulty}</span>
              </div>
              <h2 className="text-lg font-display font-bold text-slate-900 mt-0.5">
                {quizData.quizTitle}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-indigo-700 shadow-2xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(elapsedSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={() => toggleFlag(currentIndex)}
                className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 shadow-2xs ${
                  flaggedQuestions[currentIndex]
                    ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Flag question for review"
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Review Later</span>
              </button>
            </div>
          </div>

          {/* Question Navigator Dots */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {quizData.questions.map((_, qIdx) => {
              const isAnswered = userAnswers[qIdx] !== undefined;
              const isCurrent = currentIndex === qIdx;
              const isFlagged = flaggedQuestions[qIdx];

              return (
                <button
                  key={qIdx}
                  type="button"
                  onClick={() => setCurrentIndex(qIdx)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold transition-all relative shrink-0 ${
                    isCurrent
                      ? 'bg-gradient-to-tr from-amber-600 to-indigo-600 text-white shadow-sm ring-2 ring-amber-300'
                      : isAnswered
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {qIdx + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Question Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
              <span>Question {currentIndex + 1} of {quizData.questions.length}</span>
              <span className="text-indigo-600 font-medium">Concept: {currentQ.coreConcept}</span>
            </div>

            <h3 className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
              {currentQ.question}
            </h3>

            {/* 4 Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = userAnswers[currentIndex] === optIdx;
                const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => selectAnswer(currentIndex, optIdx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 shadow-2xs ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 text-slate-900 ring-1 ring-amber-400 font-medium'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-amber-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < quizData.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(quizData.questions.length - 1, prev + 1))}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Submit & Grade Quiz</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Results Breakdown */}
      {quizData && isSubmitted && (
        <div className="space-y-6">
          {/* Summary Score Card */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-indigo-50/60 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  Quiz Results Summary
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
                  {quizData.quizTitle}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Completed in {formatTimer(elapsedSeconds)} · {quizData.difficulty} Level
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-amber-700 tabular-nums">
                    {percent}%
                  </div>
                  <div className="text-xs text-slate-700">
                    <div className="font-semibold text-slate-900">{correct} of {total} Questions Correct</div>
                    <div className="text-slate-500">
                      {percent >= 80 ? '🌟 Outstanding conceptual mastery!' : percent >= 60 ? '👍 Good progress! Review explanations below.' : '📚 Focus on fundamental principles and retake.'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuizData(null);
                    setIsSubmitted(false);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Practice Quiz</span>
                </button>
              </div>
            </div>
          </div>

          {/* Question-by-Question Deep Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Detailed Question Review & Explanations</span>
            </h3>

            {quizData.questions.map((q, idx) => {
              const studentChoice = userAnswers[idx];
              const isCorrect = studentChoice === q.correctAnswerIndex;

              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-5 sm:p-6 space-y-4 shadow-2xs ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-rose-200 bg-rose-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        Q{idx + 1}.
                      </span>
                      {isCorrect ? (
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Correct</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-semibold text-rose-700">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Incorrect</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">Topic: {q.coreConcept}</span>
                  </div>

                  <p className="text-sm font-medium text-slate-900">{q.question}</p>

                  {/* Options with marked correct/incorrect */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isCorrectChoice = optIdx === q.correctAnswerIndex;
                      const isStudentChoice = optIdx === studentChoice;
                      const optionLetter = String.fromCharCode(65 + optIdx);

                      let stateClass = 'border-slate-200 bg-white text-slate-600';
                      if (isCorrectChoice) {
                        stateClass = 'border-emerald-300 bg-emerald-100/70 text-emerald-900 font-medium';
                      } else if (isStudentChoice && !isCorrect) {
                        stateClass = 'border-rose-300 bg-rose-100/70 text-rose-900 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg border text-xs sm:text-sm flex items-start gap-2.5 shadow-2xs ${stateClass}`}
                        >
                          <span className="font-mono font-bold shrink-0">{optionLetter}.</span>
                          <span className="flex-1">{opt}</span>
                          {isCorrectChoice && (
                            <span className="text-[11px] font-semibold text-emerald-800 uppercase shrink-0">
                              Correct Choice
                            </span>
                          )}
                          {isStudentChoice && !isCorrect && (
                            <span className="text-[11px] font-semibold text-rose-800 uppercase shrink-0">
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed explanation */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1 shadow-2xs">
                    <span className="font-semibold text-indigo-700 block">Why this is correct:</span>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
