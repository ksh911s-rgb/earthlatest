import React from 'react';

interface EarthVisualProps {
  resourcePercent: number;
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export const EarthVisual: React.FC<EarthVisualProps> = ({
  resourcePercent,
  status,
  size = 'lg',
  showBadge = size !== 'sm',
}) => {
  // Stage definition:
  // stage 1: 50% ~ 100% (Pristine green & blue)
  // stage 2: 20% ~ 49.9% (Smoggy, yellow/brown)
  // stage 3: 0.1% ~ 19.9% (Scorched fiery red, alarm)
  // stage 4: 0% (Extinguished, fractured, blackout)

  let stage = 1;
  if (status === 'blackout' || resourcePercent <= 0) {
    stage = 4;
  } else if (resourcePercent < 20) {
    stage = 3;
  } else if (resourcePercent < 50) {
    stage = 2;
  }

  // Visual Colors based on stage
  const oceanColor =
    stage === 1
      ? '#1E40AF' // Deep royal blue
      : stage === 2
      ? '#4A5568' // Murky slate-gray
      : stage === 3
      ? '#7F1D1D' // Scorched volcanic red
      : '#18181B'; // Pitch dark charcoal

  const continentColor =
    stage === 1
      ? '#10B981' // Vibrant emerald green
      : stage === 2
      ? '#D97706' // Yellow-ochre smog
      : stage === 3
      ? '#EA580C' // Molten orange
      : '#27272A'; // Burnt ash

  const atmosphereGlow =
    stage === 1
      ? 'rgba(59, 130, 246, 0.4)'
      : stage === 2
      ? 'rgba(217, 119, 6, 0.3)'
      : stage === 3
      ? 'rgba(239, 68, 68, 0.6)'
      : 'rgba(0, 0, 0, 0)';

  const sizeClasses =
    size === 'sm'
      ? 'w-12 h-12 sm:w-14 sm:h-14 shrink-0'
      : size === 'md'
      ? 'w-36 h-36 sm:w-44 sm:h-44'
      : 'w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96';

  return (
    <div className={`relative ${sizeClasses} flex items-center justify-center select-none`}>
      {/* Outer Atmosphere Glow */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-1000 ${
          stage === 3 ? 'animate-pulse' : ''
        }`}
        style={{
          boxShadow: size === 'sm' ? `0 0 15px 4px ${atmosphereGlow}` : `0 0 60px 20px ${atmosphereGlow}`,
        }}
      />

      {/* Earth SVG */}
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full rounded-full transition-all duration-700 ${
          stage === 4
            ? 'filter grayscale contrast-125 opacity-40'
            : stage === 3
            ? 'animate-pulse'
            : ''
        }`}
        style={{
          boxShadow: 'inset -20px -20px 40px rgba(0,0,0,0.7), inset 15px 15px 30px rgba(255,255,255,0.2)',
        }}
      >
        <defs>
          <radialGradient id="earthShading" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.75" />
          </radialGradient>

          {/* Smog Filter for Stage 2 & 3 */}
          <filter id="smogFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Ocean Sphere */}
        <circle cx="100" cy="100" r="98" fill={oceanColor} className="transition-colors duration-1000" />

        {/* Continents (Stylized world map paths) */}
        <g
          className="transition-colors duration-1000"
          fill={continentColor}
          filter={stage >= 2 ? 'url(#smogFilter)' : undefined}
        >
          {/* North America */}
          <path d="M 30,55 Q 45,35 65,40 Q 80,45 80,60 Q 65,80 50,85 Q 35,80 30,55 Z" />
          {/* South America */}
          <path d="M 55,95 Q 70,95 75,115 Q 80,140 65,160 Q 50,145 55,115 Z" />
          {/* Eurasia */}
          <path d="M 95,35 Q 125,25 155,40 Q 175,60 160,80 Q 130,85 110,65 Q 90,55 95,35 Z" />
          {/* Africa */}
          <path d="M 95,85 Q 120,80 125,105 Q 130,135 110,155 Q 95,145 90,115 Z" />
          {/* East Asia & Australia */}
          <path d="M 145,95 Q 170,90 175,115 Q 165,145 145,130 Z" />
          <path d="M 140,145 Q 165,140 160,165 Q 135,170 140,145 Z" />
        </g>

        {/* Dynamic Atmosphere Elements */}
        {stage === 1 && (
          // White gentle clouds
          <g fill="white" opacity="0.4" className="transition-opacity duration-1000">
            <path d="M 40,45 Q 60,40 75,50 Q 55,60 40,45 Z" />
            <path d="M 110,70 Q 140,65 155,75 Q 135,85 110,70 Z" />
            <path d="M 80,120 Q 110,115 130,125 Q 100,135 80,120 Z" />
          </g>
        )}

        {stage === 2 && (
          // Yellow-gray factory smog clouds
          <g fill="#78716C" opacity="0.65" className="animate-pulse">
            <circle cx="65" cy="55" r="16" />
            <circle cx="120" cy="90" r="22" />
            <circle cx="140" cy="65" r="18" />
            <circle cx="95" cy="120" r="15" />
          </g>
        )}

        {stage === 3 && (
          // Lava fissures and fiery smoke rings
          <g>
            <path
              d="M 50,55 L 75,70 L 65,120 M 110,60 L 130,85 L 120,130"
              stroke="#EF4444"
              strokeWidth="3"
              fill="none"
              strokeDasharray="4 2"
              className="animate-pulse"
            />
            {/* Warning Ring */}
            <circle cx="100" cy="100" r="95" stroke="#EF4444" strokeWidth="2" fill="none" opacity="0.8" />
          </g>
        )}

        {stage === 4 && (
          // Cracks on shattered dead earth
          <g stroke="#EF4444" strokeWidth="1.5" fill="none" opacity="0.7">
            <path d="M 100,10 L 95,80 L 120,105 L 100,190" />
            <path d="M 10,100 L 95,80 L 160,70 L 190,120" />
          </g>
        )}

        {/* Realistic Sphere 3D Light Shading Overlay */}
        <circle cx="100" cy="100" r="98" fill="url(#earthShading)" pointerEvents="none" />
      </svg>

      {/* Stage Badge in center / bottom - only rendered when showBadge is true */}
      {showBadge && (
        <div className="absolute -bottom-4 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase border shadow-lg backdrop-blur-md transition-all duration-500">
          {stage === 1 && (
            <span className="text-emerald-300 bg-emerald-950/80 border-emerald-500/40">
              🌱 1단계: 청정 자연과 무한 성장 (자원 {resourcePercent}%)
            </span>
          )}
          {stage === 2 && (
            <span className="text-amber-300 bg-amber-950/80 border-amber-500/40 animate-bounce">
              ⚠️ 2단계: 환경 오염 및 자원 급감 (자원 {resourcePercent}%)
            </span>
          )}
          {stage === 3 && (
            <span className="text-red-300 bg-red-950/90 border-red-500/60 animate-pulse">
              🚨 3단계: 임계점 도달! 행성 붕괴 경보 (자원 {resourcePercent}%)
            </span>
          )}
          {stage === 4 && (
            <span className="text-zinc-400 bg-black/90 border-zinc-700">
              💀 4단계: 자원 고갈 및 시스템 완전 정지 (0%)
            </span>
          )}
        </div>
      )}
    </div>
  );
};
