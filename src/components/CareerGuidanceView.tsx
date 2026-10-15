import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Briefcase,
  Layers,
  Code,
  Award,
  AlertTriangle,
  Loader2,
  TrendingUp,
  FolderGit2,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { CareerGuidanceData } from '../types';
import { generateCareerGuidance } from '../services/api';

interface CareerGuidanceViewProps {
  onRecordActivity: (title: string, summary?: string) => void;
}

export const CareerGuidanceView: React.FC<CareerGuidanceViewProps> = ({ onRecordActivity }) => {
  const [targetRole, setTargetRole] = useState('');
  const [interests, setInterests] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [educationLevel, setEducationLevel] = useState('Undergraduate Engineering / B.Tech');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [guidance, setGuidance] = useState<CareerGuidanceData | null>(null);

  const careerPresets = [
    {
      role: 'AI & Machine Learning Engineer',
      interests: 'Deep learning, neural networks, computer vision, LLMs',
      skills: 'Python, NumPy, basic statistics, OOP fundamentals',
      education: 'B.Tech Computer Science / AI',
    },
    {
      role: 'Full-Stack Software Engineer',
      interests: 'Modern web apps, microservices, cloud deployments, UX',
      skills: 'JavaScript/TypeScript, React basics, HTML/CSS, Git',
      education: 'Undergraduate Computer Science',
    },
    {
      role: 'Cloud & DevOps Solutions Architect',
      interests: 'Distributed cloud systems, CI/CD pipelines, Kubernetes, automation',
      skills: 'Linux bash scripting, Docker basics, networking fundamentals',
      education: 'Undergraduate Information Technology',
    },
    {
      role: 'Cybersecurity Analyst & Threat Hunter',
      interests: 'Network defense, ethical hacking, vulnerability assessments, cryptography',
      skills: 'TCP/IP protocols, Wireshark basics, Python scripting',
      education: 'B.Tech Information Security / CS',
    },
  ];

  const applyPreset = (preset: typeof careerPresets[0]) => {
    setTargetRole(preset.role);
    setInterests(preset.interests);
    setCurrentSkills(preset.skills);
    setEducationLevel(preset.education);
  };

  const handleGenerate = async (e?: React.FormEvent, customPreset?: typeof careerPresets[0]) => {
    if (e) e.preventDefault();
    const roleVal = (customPreset?.role || targetRole).trim();
    const interestVal = (customPreset?.interests || interests).trim();
    const skillsVal = (customPreset?.skills || currentSkills).trim();
    const eduVal = customPreset?.education || educationLevel;

    if (!roleVal || !interestVal) {
      setErrorMessage('Please provide both your target role and primary interests.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await generateCareerGuidance({
        targetRole: roleVal,
        interests: interestVal,
        currentSkills: skillsVal,
        educationLevel: eduVal,
      });

      setGuidance(res);
      onRecordActivity(`Career Roadmap: ${res.roleTitle}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to generate career guidance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-violet-600" />
            <span>Career & Skill Guidance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalized technical skill roadmap, hands-on portfolio project recommendations, and industry gap analysis
          </p>
        </div>

        {guidance && (
          <button
            type="button"
            onClick={() => setGuidance(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Career Query</span>
          </button>
        )}
      </div>

      {/* Preset Pickers if no guidance yet */}
      {!guidance && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-2">
            Explore High-Demand Technical Career Tracks:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {careerPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-left p-3 rounded-xl bg-slate-50/70 hover:bg-violet-50/60 border border-slate-200 hover:border-violet-300 transition-colors text-xs space-y-1 shadow-2xs"
              >
                <div className="font-semibold text-slate-900 truncate">{preset.role}</div>
                <div className="text-[11px] text-slate-500 truncate">{preset.interests}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      {!guidance ? (
        <form onSubmit={(e) => handleGenerate(e)} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Target Role / Career Aspiration *
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. AI Research Engineer, Cloud Solutions Architect"
                required
                className="w-full rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Current Education / Academic Stage
              </label>
              <input
                type="text"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                placeholder="e.g. 3rd Year B.Tech Computer Science"
                className="w-full rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Primary Interests & Passions *
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g. Building generative AI applications, high-performance distributed systems, robotics, open-source"
                required
                className="w-full rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Current Skills & Experience (What you know so far)
              </label>
              <textarea
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                rows={2}
                placeholder="e.g. Comfortable with Python and C++, built 1 basic web scraper, familiar with Git, took calculus and linear algebra..."
                className="w-full rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !targetRole.trim() || !interests.trim()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 hover:from-violet-700 hover:to-sky-700 transition-all shadow-sm hover:shadow-md shadow-violet-500/25 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Industry Skill Roadmap...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-violet-100" />
                  <span>Generate Career Guidance</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Results Presentation */
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-sky-50/50 p-6 sm:p-8 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-violet-600" />
              <span>Target Role Blueprint</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              {guidance.roleTitle}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
              {guidance.roleOverview}
            </p>
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-indigo-700 font-medium">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Industry Trend: {guidance.industryDemandTrends}</span>
            </div>
          </div>

          {/* Skill Gap Analysis */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Skill Gap & Capability Matrix</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100 space-y-2">
                <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider block">
                  Core Technical Must-Haves
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {guidance.skillGapAnalysis.mustHaveCoreSkills.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-sky-600 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-100 space-y-2">
                <span className="text-xs font-semibold text-violet-800 uppercase tracking-wider block">
                  Tools & Production Frameworks
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {guidance.skillGapAnalysis.recommendedToolsAndFrameworks.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-violet-600 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                  Vital Workplace Soft Skills
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {guidance.skillGapAnalysis.vitalSoftSkills.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Phase-by-Phase Learning Roadmap */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-violet-600" />
              <span>Phase-by-Phase Progression Roadmap</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {guidance.learningRoadmap.map((phase, pIdx) => (
                <div key={pIdx} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">
                      {phase.phase}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">{phase.focusArea}</span>
                  </div>

                  <ul className="space-y-1.5 pl-1">
                    {phase.learningMilestones.map((m, mIdx) => (
                      <li key={mIdx} className="text-xs sm:text-sm text-slate-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Hands-on Deliverable:</span>
                    <span className="text-indigo-700 font-medium">{phase.handsOnDeliverable}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Projects with Tech Stack & Resume Impact */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-sky-600" />
              <span>High-Impact Portfolio Projects</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guidance.portfolioProjects.map((proj, pIdx) => (
                <div key={pIdx} className="p-4 rounded-xl bg-slate-50/60 border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-semibold text-slate-900">{proj.projectTitle}</span>
                      <span className="text-violet-700 font-mono text-[10px] font-semibold">{proj.difficulty}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {proj.summary}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {proj.suggestedTechStack.map((tech, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-indigo-700 font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                    <span className="font-semibold text-indigo-700 block mb-0.5">Resume Impact:</span>
                    <span>{proj.resumeImpactHighlight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Required AI Disclaimer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5 space-y-3 shadow-2xs">
              <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Recommended Industry Certifications</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {guidance.recommendedCertifications.map((cert, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-1" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formal Guidance Disclaimer */}
            <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-5 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-violet-800 text-xs font-semibold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-violet-600" />
                <span>Educational Guidance Notice</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {guidance.guidanceDisclaimer}
              </p>
              <div className="text-[11px] text-slate-500 pt-1">
                SkillBridge Learning Initiative: Skill recommendations are curated for educational exploration and personal preparation.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
