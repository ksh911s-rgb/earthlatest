import React, { useState } from 'react';
import {
  adminStartGame,
  adminPauseGame,
  adminResumeGame,
  adminResetGame,
  adminUpdateConfig,
} from '../utils/socket';
import { GameState } from '../types';
import { CountryFlag } from './CountryFlag';
import {
  Play,
  Pause,
  RotateCcw,
  Bot,
  Sliders,
  X,
  Share2,
  BookOpen,
  Copy,
  Check,
  Lock,
} from 'lucide-react';

interface TeacherControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onOpenDebriefing: () => void;
  onSelectRole: (role: 'tv' | 'student' | 'split', teamId?: string) => void;
  onLock?: () => void;
}

export const TeacherControlModal: React.FC<TeacherControlModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onOpenDebriefing,
  onSelectRole,
  onLock,
}) => {
  const [resourceInput, setResourceInput] = useState(gameState.maxResource.toString());
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSetPreset = (amount: number) => {
    setResourceInput(amount.toString());
    adminResetGame(amount);
  };

  const handleApplyResource = () => {
    const parsed = parseInt(resourceInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      adminResetGame(parsed);
    }
  };

  const handleCopyLink = (teamId?: string) => {
    const baseUrl = window.location.origin;
    const url = teamId
      ? `${baseUrl}/?role=student&team=${teamId.replace('team-', '')}`
      : `${baseUrl}/?role=student`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(teamId || 'general');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold">교사용 게임 컨트롤러</h2>
          </div>
          <div className="flex items-center space-x-2">
            {onLock && (
              <button
                onClick={onLock}
                title="관리창 다시 잠그기"
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>잠그기</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Action Buttons */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              게임 진행 제어
            </label>
            <div className="grid grid-cols-3 gap-3">
              {gameState.status === 'playing' ? (
                <button
                  onClick={() => adminPauseGame()}
                  className="flex items-center justify-center space-x-2 py-3 px-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold transition shadow-lg"
                >
                  <Pause className="w-4 h-4" />
                  <span>일시 정지</span>
                </button>
              ) : gameState.status === 'paused' ? (
                <button
                  onClick={() => adminResumeGame()}
                  className="flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition shadow-lg"
                >
                  <Play className="w-4 h-4" />
                  <span>계속하기</span>
                </button>
              ) : (
                <button
                  onClick={() => adminStartGame()}
                  className="flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition shadow-lg"
                >
                  <Play className="w-4 h-4" />
                  <span>게임 시작</span>
                </button>
              )}

              <button
                onClick={() => adminResetGame(parseInt(resourceInput, 10) || gameState.maxResource)}
                className="flex items-center justify-center space-x-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-xl font-bold transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>초기화 (리셋)</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenDebriefing();
                }}
                className="flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition shadow-lg"
              >
                <BookOpen className="w-4 h-4" />
                <span>디브리핑 가이드</span>
              </button>
            </div>
          </div>

          {/* Quick Classroom View Switcher */}
          <div className="border-t border-zinc-800 pt-5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              교실 화면 전환 바로가기
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onSelectRole('tv');
                }}
                className="py-2.5 px-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 font-bold text-xs text-indigo-200 transition text-center shadow"
              >
                🖥️ 중앙 TV 화면으로 전환
              </button>
              <button
                onClick={() => {
                  onClose();
                  onSelectRole('split');
                }}
                className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-bold text-xs text-zinc-200 transition text-center shadow"
              >
                📊 통합 시뮬레이터로 전환
              </button>
              <button
                onClick={() => {
                  onClose();
                  onSelectRole('student');
                }}
                className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-bold text-xs text-zinc-200 transition text-center shadow"
              >
                📱 모둠 태블릿으로 전환
              </button>
            </div>
          </div>

          {/* Resource Setting */}
          <div className="border-t border-zinc-800 pt-5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              지구 초기 총 자원량 설정 (수업 시간 맞춤)
            </label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => handleSetPreset(45000)}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition"
              >
                ⚡ 3분 단축 (45,000)
              </button>
              <button
                onClick={() => handleSetPreset(75000)}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-500/50 text-indigo-200 transition"
              >
                ⏱️ 5분 표준 (75,000)
              </button>
              <button
                onClick={() => handleSetPreset(120000)}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition"
              >
                🌍 8분 여유 (120,000)
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={resourceInput}
                onChange={(e) => setResourceInput(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                placeholder="자원량 직접 입력"
              />
              <button
                onClick={handleApplyResource}
                className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-xl font-semibold transition"
              >
                적용 후 리셋
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-1.5">
              * 각 단계 기술 발전 간극이 2~3배 확장되어, 6개 모둠 기준 45,000은 약 2~3분, 75,000은 약 4~6분 후 자연스럽게 고갈됩니다.
            </p>
          </div>

          {/* Bot Simulation for Demo / Solo Test */}
          <div className="border-t border-zinc-800 pt-5 flex items-center justify-between bg-zinc-950/40 p-4 rounded-xl border">
            <div>
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">자동 모둠 플레이어 봇 (테스트/시연용)</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                학생 기기 없이도 6개 모둠이 알아서 클릭과 업그레이드를 진행하여 고갈 연출을 시연합니다.
              </p>
            </div>
            <button
              onClick={() => adminUpdateConfig({ isBotEnabled: !gameState.isBotEnabled })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                gameState.isBotEnabled
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {gameState.isBotEnabled ? '🤖 봇 작동 중 (ON)' : '봇 끄기 (OFF)'}
            </button>
          </div>

          {/* Student Tablet Links */}
          <div className="border-t border-zinc-800 pt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                <span>학생 태블릿 접속 링크 / 화면 전환</span>
              </label>
              <button
                onClick={() => handleCopyLink()}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                {copiedUrl === 'general' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>학생 공통 입장 URL 복사</span>
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
              {Object.keys(gameState.teams).map((tid) => {
                const team = gameState.teams[tid];
                return (
                  <div key={tid} className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectRole('student', tid);
                      }}
                      className={`p-2 rounded-lg text-xs font-bold text-center border transition truncate flex items-center justify-center gap-1 ${
                        team.isReady
                          ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                          : 'border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                      }`}
                      style={{ borderTopColor: team.color, borderTopWidth: 3 }}
                    >
                      <CountryFlag countryId={tid} size="xs" rounded="sm" />
                      <span>{team.name}</span>
                      {team.isReady && <span className="text-[10px] text-emerald-400">✓</span>}
                    </button>
                    <button
                      onClick={() => handleCopyLink(tid)}
                      title="모둠 전용 링크 복사"
                      className="text-[10px] text-zinc-400 hover:text-zinc-200 text-center py-0.5 bg-zinc-900 rounded"
                    >
                      {copiedUrl === tid ? '복사됨!' : '링크 복사'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
