import React, { useState } from 'react';
import { GameState } from '../types';
import { BookOpen, X, Sparkles, TrendingDown, FastForward } from 'lucide-react';
import { CountryFlag } from './CountryFlag';
import { ReplaySimulatorModal } from './ReplaySimulatorModal';

interface DebriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
}

export const DebriefingModal: React.FC<DebriefingModalProps> = ({
  isOpen,
  onClose,
  gameState,
}) => {
  if (!isOpen) return null;

  const [isReplayOpen, setIsReplayOpen] = useState(false);
  const history = gameState.history;
  const sortedTeams = Object.values(gameState.teams).sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-900/60 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">수업 디브리핑 & 성찰 가이드</h2>
              <p className="text-xs text-zinc-400">자원의 유한성과 지속가능한 발전을 위한 5학년 환경 토의</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Stat Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-800/80 p-3 rounded-xl border border-zinc-700/60">
              <div className="text-xs text-zinc-400">총 생산 클릭 수</div>
              <div className="text-xl font-bold font-mono text-amber-400">{gameState.totalClicks.toLocaleString()} 회</div>
            </div>
            <div className="bg-zinc-800/80 p-3 rounded-xl border border-zinc-700/60">
              <div className="text-xs text-zinc-400">고갈까지 걸린 시간</div>
              <div className="text-xl font-bold font-mono text-rose-400">
                {Math.floor(gameState.elapsedSeconds / 60)}분 {gameState.elapsedSeconds % 60}초
              </div>
            </div>
            <div className="bg-zinc-800/80 p-3 rounded-xl border border-zinc-700/60">
              <div className="text-xs text-zinc-400">1위 모둠 (성장 1등)</div>
              <div className="text-xl font-bold truncate flex items-center gap-1.5" style={{ color: sortedTeams[0]?.color }}>
                {sortedTeams[0] && <CountryFlag countryId={sortedTeams[0].id} size="xs" rounded="sm" />}
                <span>{sortedTeams[0]?.name}</span>
              </div>
            </div>
            <div className="bg-zinc-800/80 p-3 rounded-xl border border-zinc-700/60">
              <div className="text-xs text-zinc-400">결과</div>
              <div className="text-xl font-bold text-red-400 flex items-center gap-1">
                <span>전원 마비 (0%)</span>
              </div>
            </div>
          </div>

          {/* Graphical Analysis of the Tragedy */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  <span>지구 자원 고갈 vs 모둠별 성장 그래프</span>
                </span>
                <span className="text-[11px] text-zinc-500 block mt-0.5">
                  붉은 선(자원량)이 급락할 때 모둠 점수는 폭증했습니다
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsReplayOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-black text-xs transition shadow-md flex items-center gap-1.5 shrink-0 self-start sm:self-auto ring-1 ring-amber-300"
              >
                <FastForward className="w-4 h-4 fill-black" />
                <span>🎬 3배속 시뮬레이션 영상으로 다시보기</span>
              </button>
            </div>

            {/* SVG Visual Timeline */}
            <div className="w-full h-44 bg-zinc-900/90 rounded-lg p-2 relative overflow-hidden flex items-end">
              {history.length > 1 ? (
                <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="resourceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#333" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#333" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#333" strokeDasharray="3 3" />

                  {/* Resource Area / Line */}
                  <path
                    d={
                      `M 0,${160 - (history[0].resourcePercent / 100) * 150} ` +
                      history
                        .map((h, i) => {
                          const x = (i / (history.length - 1)) * 500;
                          const y = 160 - (h.resourcePercent / 100) * 150;
                          return `L ${x},${y}`;
                        })
                        .join(' ') +
                      ` L 500,160 L 0,160 Z`
                    }
                    fill="url(#resourceGrad)"
                  />
                  <path
                    d={
                      `M 0,${160 - (history[0].resourcePercent / 100) * 150} ` +
                      history
                        .map((h, i) => {
                          const x = (i / (history.length - 1)) * 500;
                          const y = 160 - (h.resourcePercent / 100) * 150;
                          return `L ${x},${y}`;
                        })
                        .join(' ')
                    }
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2.5"
                  />

                  {/* Team scores curves */}
                  {Object.keys(gameState.teams).map((tid) => {
                    const maxScore = Math.max(1, sortedTeams[0]?.score || 1);
                    const color = gameState.teams[tid].color;
                    const pathD =
                      `M 0,155 ` +
                      history
                        .map((h, i) => {
                          const x = (i / (history.length - 1)) * 500;
                          const sc = h.teamScores?.[tid] || 0;
                          const y = 155 - (sc / maxScore) * 140;
                          return `L ${x},${y}`;
                        })
                        .join(' ');
                    return (
                      <path
                        key={tid}
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        strokeDasharray="2 1"
                        opacity="0.8"
                      />
                    );
                  })}
                </svg>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                  게임을 플레이하면 실시간 자원 및 성장 그래프가 여기에 기록됩니다.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 px-1">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                지구 자원량 (100% ➔ 0%)
              </span>
              <div className="flex items-center gap-2">
                {sortedTeams.map((t) => (
                  <span key={t.id} className="flex items-center gap-1">
                    <CountryFlag countryId={t.id} size="xs" rounded="sm" />
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: t.color }} />
                    <span>{t.name} ({Math.round(t.score)}점)</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Guided Debriefing Question Steps for Teacher */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>교사 지도용 질문 및 토의 순서</span>
            </h3>

            <div className="grid gap-3">
              {/* Question 1 */}
              <div className="p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    "학생들의 첫 반응: '어? 선생님 갑자기 화면이 멈췄어요! 버그인가요?'"
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1">
                    👉 <strong>교사의 발문:</strong> "화면에 뭐라고 적혀 있나요? 왜 게임이 멈췄을까요?"
                    <br />
                    (학생들이 <i>'자원이 고갈되어 공장이 중단되었습니다'</i> 라는 문구를 소리 내어 읽게 유도합니다.)
                  </p>
                </div>
              </div>

              {/* Question 2 */}
              <div className="p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    "우리가 1등을 하기 위해 광클을 할 때, 지구의 자원은 어떻게 되었나요?"
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1">
                    👉 <strong>교사의 발문:</strong> "다른 모둠을 이기기 위해 증기 공장, AI 로봇으로 업그레이드할 때 자원은 얼마나 빨리 사라졌나요? 왜 아무도 생산을 멈추지 않았을까요?"
                    <br />
                    (나만 멈추면 다른 모둠이 1등을 하니까 멈출 수 없었던 심리를 고백하게 함 - <strong>공유지의 비극</strong>)
                  </p>
                </div>
              </div>

              {/* Question 3 */}
              <div className="p-4 bg-zinc-800/60 rounded-xl border border-zinc-700/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    "만약 우리가 살고 있는 진짜 지구에서 끝없는 경쟁과 성장만 추구한다면?"
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1">
                    👉 <strong>교사의 발문:</strong> "1등을 차지한 모둠도 결국 게임 오버가 되었습니다. 자원이 사라진 지구에서는 1등도, 5등도 모두 생존할 수 없습니다."
                  </p>
                </div>
              </div>

              {/* Question 4 */}
              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/40 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-300">
                    "진정한 탈출구: 지속가능한 발전(SDGs)이란 무엇일까?"
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1">
                    👉 <strong>결론 정리:</strong> "무조건적인 양적 팽창이 아닌, 자원의 회복 속도를 생각하며 함께 협력하고 나누는 '지속가능한 삶'이 왜 필요한지 학생 스스로 깨닫도록 수업을 마무리합니다."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition shadow-lg"
          >
            확인 및 닫기
          </button>
        </div>
      </div>

      {/* 3x Match Replay Simulator Modal */}
      <ReplaySimulatorModal
        isOpen={isReplayOpen}
        onClose={() => setIsReplayOpen(false)}
        gameState={gameState}
      />
    </div>
  );
};
