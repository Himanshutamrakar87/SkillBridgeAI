import React from 'react';

interface SkillBridgeLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  animated?: boolean;
}

export const SkillBridgeLogo: React.FC<SkillBridgeLogoProps> = ({
  size = 'md',
  className = '',
  showWordmark = false,
  wordmarkClassName = '',
  animated = false,
}) => {
  // Determine pixel size for icon
  const pixelSize = typeof size === 'number'
    ? size
    : size === 'xs'
    ? 22
    : size === 'sm'
    ? 28
    : size === 'md'
    ? 36
    : size === 'lg'
    ? 48
    : 64; // xl

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Unique SVG Brand Mark */}
      <div
        className={`relative shrink-0 flex items-center justify-center transition-transform duration-300 ${
          animated ? 'hover:scale-105' : ''
        }`}
        style={{ width: pixelSize, height: pixelSize }}
      >
        <svg
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          <defs>
            {/* Primary Bridge Gradient (Indigo -> Violet -> Cyan) */}
            <linearGradient id="sb-bridge-primary" x1="4" y1="48" x2="52" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="45%" stopColor="#6366F1" />
              <stop offset="75%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Radiant Accent Gradient for AI Star & Nodes */}
            <linearGradient id="sb-spark-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>

            {/* Neural Cable Gradient */}
            <linearGradient id="sb-cable-grad" x1="8" y1="36" x2="48" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
            </linearGradient>

            {/* Radial Core Glow */}
            <radialGradient id="sb-apex-glow" cx="28" cy="18" r="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient Apex Aura */}
          <circle cx="28" cy="18" r="14" fill="url(#sb-apex-glow)" />

          {/* Foundation Left Pillar (Student Knowledge Base) */}
          <rect
            x="7"
            y="28"
            width="5.5"
            height="18"
            rx="2.75"
            fill="#4F46E5"
            opacity="0.9"
          />

          {/* Foundation Right Pillar (Ascended Career Destination) */}
          <rect
            x="43.5"
            y="18"
            width="5.5"
            height="28"
            rx="2.75"
            fill="url(#sb-bridge-primary)"
          />

          {/* Stepping Stride Pillars (Skill Milestones) */}
          <rect x="19" y="32" width="4" height="14" rx="2" fill="#6366F1" opacity="0.45" />
          <rect x="31" y="27" width="4" height="19" rx="2" fill="#8B5CF6" opacity="0.6" />

          {/* Horizon Foundation Beam */}
          <rect x="6" y="44" width="44" height="4" rx="2" fill="#E2E8F0" />
          <rect x="7" y="44.5" width="42" height="3" rx="1.5" fill="url(#sb-bridge-primary)" opacity="0.85" />

          {/* The Grand Bridge Arch (S & B Ribbon Trajectory) */}
          {/* Main parabolic bridge deck curve sweeping up and over */}
          <path
            d="M 7 34 C 14 18, 22 13, 28 13 C 34 13, 42 16, 48 22"
            stroke="url(#sb-bridge-primary)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Secondary suspension arch with neural cable rhythm */}
          <path
            d="M 9.5 28 C 16 11, 23 8, 28 8 C 33 8, 41 12, 46.5 17"
            stroke="url(#sb-cable-grad)"
            strokeWidth="1.75"
            strokeDasharray="2.5 2"
            strokeLinecap="round"
          />

          {/* Skill Bridge Nodes (Interconnected learning checkpoints) */}
          <circle cx="10" cy="30" r="2.5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="21" cy="18" r="2.5" fill="#6366F1" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="35" cy="16.5" r="2.5" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="46" cy="22" r="3" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* The AI Nexus Star (Radiant 4-point beacon of intelligence) at bridge apex */}
          <g transform="translate(28, 11)">
            {/* 4-point star path centered at (0, 0) */}
            <path
              d="M 0 -8 C 0.6 -2.5, 2.5 -0.6, 8 0 C 2.5 0.6, 0.6 2.5, 0 8 C -0.6 2.5, -2.5 0.6, -8 0 C -2.5 -0.6, -0.6 -2.5, 0 -8 Z"
              fill="url(#sb-spark-grad)"
            />
            {/* Core bright nucleus */}
            <circle cx="0" cy="0" r="1.8" fill="#FFFFFF" />
          </g>

          {/* Dynamic Forward Momentum Sparkle */}
          <circle cx="39" cy="7.5" r="1.2" fill="#38BDF8" />
          <circle cx="17" cy="10" r="1" fill="#818CF8" />
        </svg>
      </div>

      {/* Optional Wordmark */}
      {showWordmark && (
        <div className={`flex flex-col ${wordmarkClassName}`}>
          <div className="flex items-center gap-1 leading-none">
            <span className="font-display font-bold text-slate-900 tracking-tight text-lg">
              SkillBridge
            </span>
            <span className="font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 text-lg">
              AI
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase mt-0.5">
            Smart Learning Platform
          </span>
        </div>
      )}
    </div>
  );
};
