import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameState, HistorySnapshot } from '../types';
import { CountryFlag } from './CountryFlag';
import { calculateSubResources } from '../utils/resources';
import { UPGRADES } from '../utils/constants';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  X,
  Clock,
  Flame,
  Wind,
  Trees,
  AlertTriangle,
  Trophy,
  Zap,
} from 'lucide-react';

interface ReplaySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
}

export const ReplaySimulatorModal: React.FC<ReplaySimulatorModalProps> = ({
  isOpen,
  onClose,
  gameState,
}) => {
  if (!isOpen) return null;

  // Build or sanitize the history sequence
  const historyData: HistorySnapshot[] = useMemo(() => {
    if (gameState.history && gameState.history.length >= 2) {
      return gameState.history;
    }

    // Fallback synthesize realistic timeline if history wasn't recorded (e.g. quick test)
    const frames: HistorySnapshot[] = [];
    const totalSteps = Math.max(30, gameState.elapsedSeconds || 60);
    const sortedTeams = Object.values(gameState.teams);

    for (let i = 0; i <= totalSteps; i++) {
      const progress = i / totalSteps;
      // Exponential resource drain curve
      const resPercent = Math.max(0, Number((100 - Math.pow(progress, 1.4) * 100).toFixed(1)));
      const resRemaining = Math.round((resPercent / 100) * gameState.maxResource);

      const teamScores: Record<string, number> = {};
      const teamTiers: Record<string, string> = {};
      let totalScore = 0;

      sortedTeams.forEach((t, idx) => {
        // Teams gain score nonlinearly
        const tierIdx = Math.min(5, Math.floor(progress * (3 + (idx % 3))));
        const targetTier = UPGRADES[tierIdx]?.id || 'tier-1';
        const sc = Math.round(t.score * Math.pow(progress, 1.8));
        teamScores[t.id] = sc;
        teamTiers[t.id] = targetTier;
        totalScore += sc;
      });

      frames.push({
        timestamp: Date.now() - (totalSteps - i) * 1000,
        resourcePercent: resPercent,
        resourceRemaining: resRemaining,
        totalScore,
        teamScores,
        teamTiers,
      });
    }
    return frames;
  }, [gameState.history, gameState.teams, gameState.maxResource, gameState.elapsedSeconds]);

  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(3); // 3x speed by default as requested!
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalFrames = historyData.length;
  const currentSnapshot = historyData[currentFrameIdx] || historyData[0];

  // Auto-play loop running at selected speed
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      return;
    }

    // Standard interval is 300ms divided by speed multiplier for silky smooth simulation
    const intervalMs = Math.max(50, Math.round(300 / speed));

    playTimerRef.current = setInterval(() => {
      setCurrentFrameIdx((prev) => {
        if (prev >= totalFrames - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, speed, totalFrames]);

  // Restart replay
  const handleRestart = () => {
    setCurrentFrameIdx(0);
    setIsPlaying(true);
  };

  // Sub-resources at current frame
  const subResources = useMemo(() => {
    return calculateSubResources(
      currentSnapshot.resourceRemaining,
      gameState.maxResource,
      currentSnapshot.resourcePercent
    );
  }, [currentSnapshot.resourceRemaining, gameState.maxResource, currentSnapshot.resourcePercent]);

  // Sorted teams for ranking race at current frame
  const sortedTeamsAtFrame = useMemo(() => {
    return Object.keys(gameState.teams)
      .map((tid) => {
        const team = gameState.teams[tid];
        const score = currentSnapshot.teamScores?.[tid] ?? 0;
        const tierId = currentSnapshot.teamTiers?.[tid] || team.currentUpgradeId;
        return {
          ...team,
          score,
          tierId,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [gameState.teams, currentSnapshot]);

  const topScoreAtFrame = Math.max(1, sortedTeamsAtFrame[0]?.score || 1);

  // Time elapsed in replay
  const startTime = historyData[0]?.timestamp || 0;
  const currentTime = currentSnapshot.timestamp || startTime;
  const elapsedSec = Math.max(0, Math.round((currentTime - startTime) / 1000));
  const totalSec = Math.max(
    1,
    Math.round((historyData[totalFrames - 1]?.timestamp - startTime) / 1000)
  );

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Phase indicator
  const phaseInfo = useMemo(() => {
    const p = currentSnapshot.resourcePercent;
    if (p >= 75) {
      return {
        badge: '초기 평화기 (100%~75%)',
        desc: '수작업과 초기 증기 기관. 자원이 넉넉해 보이지만 소비가 시작됩니다.',
        color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50',
      };
    }
    if (p >= 40) {
      return {
        badge: '산업 가속기 (75%~40%)',
        desc: '공장 굴뚝과 자동화 로봇 도입! 점수 경쟁이 과열되며 자원이 급감합니다.',
        color: 'text-amber-400 bg-amber-950/80 border-amber-500/50',
      };
    }
    if (p > 0) {
      return {
        badge: '한계 채굴 경보 (40%~1%)',
        desc: 'AI 스마트 시티와 초대형 굴착기로 마지막 남은 지하 자원을 고갈시키는 중!',
        color: 'text-rose-400 bg-rose-950/80 border-rose-500/50 animate-pulse',
      };
    }
    return {
      badge: '전면 고갈 & 블랙아웃 (0%)',
      desc: '자원 0%! 1등을 다투는 동안 마을의 모든 전력과 기계가 전면 마비되었습니다.',
      color: 'text-red-500 bg-red-950/90 border-red-600/80 animate-bounce',
    };
  }, [currentSnapshot.resourcePercent]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-5xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <FastForward className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  실제 게임 양상 시뮬레이션 리플레이
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-black shadow">
                  ⚡ {speed}배속 재생
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                게임 시작부터 자원 0% 고갈까지의 변화를 고속 시뮬레이션으로 복기합니다
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Replay Simulation Screen Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Phase Banner */}
          <div
            className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${phaseInfo.color}`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 uppercase tracking-wider shrink-0">
                {phaseInfo.badge}
              </span>
              <span className="text-xs font-medium text-white/90">{phaseInfo.desc}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs font-mono font-bold self-end sm:self-auto shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {formatMinSec(elapsedSec)} / {formatMinSec(totalSec)}
              </span>
            </div>
          </div>

          {/* 1. Earth Resource Gauge & Detailed Sub-resources */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  지구 총 잔여 자원량 (시뮬레이션 실시간)
                </span>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span
                    className={`text-2xl sm:text-3xl font-black font-mono ${
                      currentSnapshot.resourcePercent <= 20
                        ? 'text-red-500'
                        : currentSnapshot.resourcePercent <= 50
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {currentSnapshot.resourcePercent}%
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    ({currentSnapshot.resourceRemaining.toLocaleString()} /{' '}
                    {gameState.maxResource.toLocaleString()})
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="text-right">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    currentSnapshot.resourcePercent <= 0
                      ? 'bg-red-950 text-red-400 border-red-700 animate-pulse'
                      : currentSnapshot.resourcePercent <= 30
                      ? 'bg-amber-950 text-amber-400 border-amber-700'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  }`}
                >
                  {currentSnapshot.resourcePercent <= 0
                    ? '💀 완전 고갈'
                    : currentSnapshot.resourcePercent <= 30
                    ? '⚠️ 위험 경보'
                    : '🟢 채굴 진행 중'}
                </span>
              </div>
            </div>

            {/* Total Main Progress Bar */}
            <div className="w-full bg-zinc-900 rounded-full h-4 overflow-hidden p-0.5 border border-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  currentSnapshot.resourcePercent <= 20
                    ? 'bg-gradient-to-r from-red-600 to-rose-500'
                    : currentSnapshot.resourcePercent <= 50
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, currentSnapshot.resourcePercent))}%` }}
              />
            </div>

            {/* Detailed Sub-resources: Oil, Gas, Coal, Forest */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {subResources.map((res) => (
                <div key={res.id} className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-bold flex items-center gap-1.5 text-zinc-200">
                      <span className="text-sm select-none">{res.icon}</span>
                      <span>{res.name}</span>
                    </span>
                    <span className="font-mono font-bold" style={{ color: res.color }}>
                      {res.percent}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-150 bg-gradient-to-r ${res.barColor}`}
                      style={{ width: `${res.percent}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                    <span>{res.remaining.toLocaleString()} {res.unit}</span>
                    <span className={`px-1 py-0.2 rounded border text-[8px] font-bold ${res.statusClass}`}>
                      {res.statusText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. 6-Country Dynamic Ranking Race Board at Current Timestamp */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>6개국 실시간 등수 추이 (타임라인 동적 레이스)</span>
              </span>
              <span className="text-[11px] text-zinc-400">
                총 생산 발전도: {Math.round(currentSnapshot.totalScore).toLocaleString()} pts
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {sortedTeamsAtFrame.map((team, idx) => {
                const rank = idx + 1;
                const tier = UPGRADES.find((u) => u.id === team.tierId) || UPGRADES[0];
                const scorePercent = Math.min(
                  100,
                  Math.round((team.score / topScoreAtFrame) * 100)
                );

                return (
                  <div
                    key={team.id}
                    className={`p-2.5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                      rank === 1 && team.score > 0
                        ? 'bg-zinc-900 border-amber-500 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/30'
                        : 'bg-zinc-900/60 border-zinc-800'
                    }`}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: team.color }}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            rank === 1
                              ? 'bg-amber-400 text-black'
                              : rank === 2
                              ? 'bg-slate-300 text-black'
                              : rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                        </span>
                        <CountryFlag countryId={team.id} size="sm" rounded="sm" />
                      </div>

                      <div className="font-bold text-xs text-white truncate mb-0.5">
                        {team.name}
                      </div>

                      <div className="text-[10px] text-zinc-400 truncate mb-1">
                        {tier.name.split(':')[0]}
                      </div>

                      <div className="text-base font-black font-mono text-white">
                        {Math.round(team.score).toLocaleString()}
                        <span className="text-[9px] font-normal text-zinc-400 ml-0.5">pts</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-zinc-800">
                      <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-150"
                          style={{
                            width: `${scorePercent}%`,
                            backgroundColor: team.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interactive Playback Control Bar (Footer) */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 space-y-3">
          {/* Progress Scrubber Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>시작 (100% 자원)</span>
              <span className="font-mono text-amber-400 font-bold">
                {Math.round((currentFrameIdx / (totalFrames - 1 || 1)) * 100)}% 진행됨
              </span>
              <span>종료 (0% 고갈)</span>
            </div>

            <input
              type="range"
              min={0}
              max={totalFrames - 1}
              value={currentFrameIdx}
              onChange={(e) => {
                setCurrentFrameIdx(parseInt(e.target.value, 10));
                setIsPlaying(false);
              }}
              className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition"
            />
          </div>

          {/* Playback Controls & Speed Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Left: Play/Pause/Restart */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shadow-amber-950/40"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? '일시 정지' : '재생'}</span>
              </button>

              <button
                onClick={handleRestart}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
                title="처음부터 다시 시뮬레이션"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>처음부터</span>
              </button>
            </div>

            {/* Center: Speed Multiplier Controls (1x, 3x, 5x) */}
            <div className="flex items-center space-x-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-400 px-2 font-bold">재생 배속:</span>
              {[1, 3, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                    speed === s
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {s}배속 {s === 3 ? '(기본)' : ''}
                </button>
              ))}
            </div>

            {/* Right: Close Button */}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition self-end sm:self-auto"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
