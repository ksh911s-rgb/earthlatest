import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, UpgradeDef } from '../types';
import { UPGRADES } from '../utils/constants';
import { CountryFlag } from './CountryFlag';
import { producePoints, purchaseUpgrade, joinTeam, setTeamReady } from '../utils/socket';
import { soundEngine } from '../utils/audio';
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  Volume2,
  VolumeX,
  Radio,
  Check,
  Sparkles,
} from 'lucide-react';

interface StudentTabletScreenProps {
  gameState: GameState;
  initialTeamId?: string;
  onSwitchToTv?: () => void;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export const StudentTabletScreen: React.FC<StudentTabletScreenProps> = ({
  gameState,
  initialTeamId = 'team-1',
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId);
  const [hasJoined, setHasJoined] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [combo, setCombo] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Click batching queue to support high frequency multi-touch without packet floods
  const pendingClicksRef = useRef(0);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevStatusRef = useRef(gameState.status);

  const team = gameState.teams[selectedTeamId] || gameState.teams['team-1'];
  const currentUpgrade = UPGRADES.find((u) => u.id === team.currentUpgradeId) || UPGRADES[0];
  const currentTierIndex = UPGRADES.findIndex((u) => u.id === team.currentUpgradeId);

  // Sync Audio Mute
  useEffect(() => {
    soundEngine.setMuted(isMuted);
  }, [isMuted]);

  // Handle Blackout Transition
  useEffect(() => {
    if (gameState.status === 'blackout' && prevStatusRef.current !== 'blackout') {
      soundEngine.playBlackout();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 400]);
      }
    }
    prevStatusRef.current = gameState.status;
  }, [gameState.status]);

  // Periodic flush of pending clicks (every 50ms)
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingClicksRef.current > 0 && gameState.status === 'playing') {
        const batch = pendingClicksRef.current;
        pendingClicksRef.current = 0;
        producePoints({
          teamId: selectedTeamId,
          clicks: batch,
          clientTimestamp: Date.now(),
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [selectedTeamId, gameState.status]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    joinTeam(selectedTeamId);
    setHasJoined(true);
  };

  // Click / Tap Handler supporting Multi-touch!
  const triggerProduceTap = useCallback(
    (clientX?: number, clientY?: number) => {
      if (gameState.status !== 'playing') return;

      // Increment pending click
      pendingClicksRef.current += 1;

      // Audio & Haptic Feedback
      soundEngine.playTap(currentTierIndex + 1);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
      }

      // Combo streak
      setCombo((prev) => prev + 1);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => setCombo(0), 1200);

      // Spawn floating score particle
      const id = Date.now() + Math.random();
      const x = clientX ?? window.innerWidth / 2 + (Math.random() * 80 - 40);
      const y = clientY ?? window.innerHeight / 2 + (Math.random() * 80 - 40);
      const text = `+${currentUpgrade.pointsPerTap}`;

      setFloatingTexts((prev) => [
        ...prev.slice(-15),
        { id, text, x, y, color: team.color },
      ]);

      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
      }, 700);
    },
    [gameState.status, currentTierIndex, currentUpgrade.pointsPerTap, team.color]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setButtonPressed(true);
    triggerProduceTap(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setButtonPressed(false);
  };

  // Multi-touch handler: allows multiple fingers / multiple students on 1 tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      triggerProduceTap(t.clientX, t.clientY);
    }
  };

  const handleUpgradeClick = (upgrade: UpgradeDef) => {
    if (gameState.status !== 'playing') return;
    if (team.score >= upgrade.cost) {
      purchaseUpgrade({
        teamId: selectedTeamId,
        upgradeId: upgrade.id,
      });
      soundEngine.playUpgrade();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }
    }
  };

  // Find class rank
  const sortedTeams = Object.values(gameState.teams).sort((a, b) => b.score - a.score);
  const myRank = sortedTeams.findIndex((t) => t.id === selectedTeamId) + 1;

  // If in Blackout: Render the catastrophic Blackout screen
  if (gameState.status === 'blackout') {
    return (
      <div className="relative w-full min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none overflow-hidden">
        {/* Red flashing border */}
        <div className="absolute inset-0 pointer-events-none border-[8px] sm:border-[12px] border-red-700/80 shadow-[inset_0_0_100px_rgba(239,68,68,0.8)] animate-pulse" />

        <div className="relative z-10 max-w-md w-full bg-zinc-950/90 border border-red-600/80 p-6 sm:p-8 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-4 text-red-500 animate-bounce">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest mb-1">
            CRITICAL SYSTEM CRASH
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-red-500 font-mono mb-4 leading-tight">
            SYSTEM ERROR: 자원 0% 고갈
          </h2>

          <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 mb-4 text-left font-mono text-xs text-red-300 space-y-1">
            <p className="font-bold">❌ 모든 공장 및 전력 공급 즉시 중단</p>
            <p>❌ 터치 조작 및 생산 영구 차단</p>
            <p>❌ 지구 총 자원 소모율: 100% 한계 돌파</p>
          </div>

          <p className="text-sm font-bold text-white mb-2">
            "우리가 1등을 위해 달리는 동안, 지구는 멈췄습니다."
          </p>

          <p className="text-xs text-zinc-400 mb-6">
            모든 조작이 불가합니다. 고개를 들어 <strong>중앙 화면(선생님)</strong>을 주목해 주세요.
          </p>

          <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs text-zinc-300">
            우리 모둠 최종 점수:{' '}
            <strong className="text-amber-400 font-mono text-sm">
              {Math.round(team.score).toLocaleString()} pts
            </strong>{' '}
            ({myRank}위)
          </div>
        </div>
      </div>
    );
  }

  // Pre-join Lobby (Select Team)
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 inline-block">🏭</span>
            <h2 className="text-2xl font-black tracking-tight">지구 발전 게임</h2>
            <p className="text-xs text-zinc-400 mt-1">
              수업에 참여할 우리 모둠을 선택하세요
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                참여할 모둠 선택
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.keys(gameState.teams).map((tid) => {
                  const t = gameState.teams[tid];
                  const isSelected = selectedTeamId === tid;
                  return (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => setSelectedTeamId(tid)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <CountryFlag countryId={t.id} size="sm" rounded="sm" />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="text-sm font-bold">{t.name}</span>
                      </div>
                      {isSelected && <span className="text-xs font-bold text-indigo-400">선택됨</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-base text-white transition shadow-lg shadow-indigo-950/50"
            >
              게임 화면으로 입장하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Waiting Room before teacher starts
  if (gameState.status === 'waiting') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center p-6 text-center">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2"
            style={{ borderColor: team.color, backgroundColor: `${team.color}20` }}
          >
            <Radio className="w-8 h-8 animate-pulse" style={{ color: team.color }} />
          </div>

          <div className="flex items-center justify-center space-x-2 mb-1">
            <CountryFlag countryId={selectedTeamId} size="lg" rounded="sm" />
            <h2 className="text-2xl font-black">{team.name} 준비 완료!</h2>
          </div>
          <p className="text-xs text-zinc-400 mb-6">
            선생님이 중앙 화면에서 [게임 시작] 버튼을 누르면 시작됩니다.
          </p>

          <div className="bg-zinc-950/60 rounded-2xl p-4 border border-zinc-800 mb-6 text-left space-y-2 text-xs text-zinc-300">
            <div className="font-bold text-white text-sm mb-1">🎮 게임 팁</div>
            <p>1. [생산하기] 버튼을 가능한 한 빠르고 많이 누르세요!</p>
            <p>2. 점수를 모아 공장/로봇으로 업그레이드하면 점수가 폭증합니다!</p>
            <p>3. 태블릿 1대에 모둠원 여러 명이 동시에 터치할 수 있습니다!</p>
          </div>

          <button
            onClick={() => {
              setTeamReady(selectedTeamId, false);
              setHasJoined(false);
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300 underline"
          >
            다른 모둠으로 변경하기
          </button>
        </div>
      </div>
    );
  }

  // Split upgrades into Left (1~3단계) and Right (4~6단계)
  const leftUpgrades = UPGRADES.slice(0, 3);
  const rightUpgrades = UPGRADES.slice(3, 6);

  const renderUpgradeCard = (upgrade: UpgradeDef) => {
    const globalIdx = UPGRADES.findIndex((u) => u.id === upgrade.id);
    const isCurrent = team.currentUpgradeId === upgrade.id;
    const isPast = globalIdx < currentTierIndex;
    const canAfford = team.score >= upgrade.cost && !isCurrent && !isPast;

    return (
      <button
        key={upgrade.id}
        onClick={() => handleUpgradeClick(upgrade)}
        disabled={isCurrent || isPast || !canAfford}
        className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col justify-between relative shadow-sm ${
          isCurrent
            ? 'bg-indigo-950/70 border-indigo-400 text-white shadow-lg ring-1 ring-indigo-400/50'
            : isPast
            ? 'bg-zinc-950/90 border-zinc-900 text-zinc-600 opacity-40 cursor-not-allowed pointer-events-none filter grayscale'
            : canAfford
            ? 'bg-amber-950/40 border-amber-500 hover:bg-amber-900/50 text-white animate-pulse shadow-amber-950/30'
            : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span
              className={`text-xs font-black truncate ${
                isPast ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-white'
              }`}
            >
              {upgrade.name}
            </span>
            {isCurrent && (
              <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-black shrink-0">
                사용 중
              </span>
            )}
            {isPast && (
              <span className="text-[9px] bg-zinc-900 text-zinc-600 border border-zinc-800 px-1 py-0.5 rounded font-bold shrink-0">
                이전 기술
              </span>
            )}
          </div>
          <div className={`text-[10px] truncate mb-1 ${isPast ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {upgrade.subtitle}
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`text-xs sm:text-sm font-mono font-black ${
                isPast ? 'text-zinc-600' : 'text-amber-400'
              }`}
            >
              +{upgrade.pointsPerTap} 점/클릭
            </span>
            {upgrade.passivePointsPerSec > 0 && (
              <span
                className={`text-[10px] font-mono ${
                  isPast ? 'text-zinc-600' : 'text-emerald-400'
                }`}
              >
                (+{upgrade.passivePointsPerSec}/초)
              </span>
            )}
          </div>
        </div>

        {/* Price & Status */}
        <div
          className={`mt-2 pt-1.5 border-t flex items-center justify-between text-[10px] ${
            isPast ? 'border-zinc-900' : 'border-zinc-800/80'
          }`}
        >
          <span className={`font-mono font-bold ${isPast ? 'text-zinc-600' : 'text-white'}`}>
            {isPast
              ? '개발 완료'
              : upgrade.cost === 0
              ? '기본 제공'
              : `${upgrade.cost.toLocaleString()} 점`}
          </span>
          {canAfford && !isCurrent && !isPast && (
            <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded animate-bounce">
              구매 가능!
            </span>
          )}
          {isCurrent && (
            <span className="text-[9px] text-indigo-300 flex items-center gap-0.5">
              <Check className="w-3 h-3 text-indigo-400" /> 활성화
            </span>
          )}
          {isPast && (
            <span className="text-[9px] text-zinc-600">
              지나간 단계
            </span>
          )}
          {!canAfford && !isCurrent && !isPast && (
            <span className="text-[9px] text-zinc-500">
              (자원 -{upgrade.resourceCostPerTap})
            </span>
          )}
        </div>
      </button>
    );
  };

  // Active Play Screen
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between select-none touch-manipulation overflow-x-hidden">
      {/* Floating Click Particles */}
      <div className="fixed inset-0 pointer-events-none z-40">
        {floatingTexts.map((f) => (
          <div
            key={f.id}
            className="absolute text-2xl sm:text-3xl font-black font-mono animate-float-fade"
            style={{
              left: f.x - 20,
              top: f.y - 30,
              color: f.color,
              textShadow: '0 0 12px rgba(0,0,0,0.9)',
            }}
          >
            {f.text}
          </div>
        ))}
      </div>

      {/* Top Header: Team Info & Rank */}
      <header className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-3">
          <CountryFlag countryId={selectedTeamId} size="md" rounded="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black">{team.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                🏆 현재 {myRank}위
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              현재 기술: <strong className="text-zinc-200">{currentUpgrade.name}</strong> (+{currentUpgrade.pointsPerTap}/클릭)
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Quick Team Switcher / Back */}
          <button
            onClick={() => setHasJoined(false)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
          >
            모둠 변경
          </button>
        </div>
      </header>

      {/* Main 3-Column Layout: Left Upgrades (1~3단계) | Center Clicker | Right Upgrades (4~6단계) */}
      <div className="flex-1 flex flex-col md:flex-row items-stretch justify-between p-3 sm:p-4 gap-4 max-w-7xl mx-auto w-full">
        {/* LEFT SIDE: 1~3단계 기술 업그레이드 */}
        <aside className="w-full md:w-56 lg:w-64 flex flex-col justify-center order-2 md:order-1 shrink-0">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-3 sm:p-3.5 shadow-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1 pb-1 border-b border-zinc-800/80">
              <span className="text-[11px] font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>기초~중기 산업 기술</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-bold">1~3단계</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2">
              {leftUpgrades.map((u) => renderUpgradeCard(u))}
            </div>
          </div>
        </aside>

        {/* CENTER: Giant Clicker Button & Score Dashboard */}
        <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 max-w-md mx-auto w-full order-1 md:order-2">
          {/* Score Card */}
          <div className="w-full text-center mb-3 sm:mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              우리 모둠 총 발전도 (점수)
            </span>
            <div className="text-5xl sm:text-6xl font-black font-mono text-white tracking-tight flex items-center justify-center gap-2">
              <span style={{ color: team.color }}>{Math.round(team.score).toLocaleString()}</span>
              <span className="text-base sm:text-lg font-normal text-zinc-400">pts</span>
            </div>

            {/* Combo Indicator */}
            {combo > 5 && (
              <div className="mt-1 text-xs font-black tracking-wider text-amber-400 animate-bounce">
                🔥 광클릭 콤보 {combo} 연타 중! 🔥
              </div>
            )}
          </div>

          {/* GIANT PRODUCTION CLICKER BUTTON (Touch target) */}
          <div className="relative flex items-center justify-center w-60 h-60 sm:w-68 sm:h-68 my-1 sm:my-2">
            {/* Pulsing ring */}
            <div
              className="absolute inset-0 rounded-full transition-all duration-300 opacity-30"
              style={{
                backgroundColor: team.color,
                transform: buttonPressed ? 'scale(1.15)' : 'scale(1.0)',
              }}
            />

            <button
              id="giant-produce-button"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onTouchStart={handleTouchStart}
              className={`relative w-52 h-52 sm:w-60 sm:h-60 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl transition-transform duration-75 active:scale-95 cursor-pointer select-none border-4 border-white/20`}
              style={{
                backgroundColor: team.color,
                boxShadow: `0 12px 35px ${team.color}60, inset 0 6px 15px rgba(255,255,255,0.3), inset 0 -6px 15px rgba(0,0,0,0.4)`,
                transform: buttonPressed ? 'scale(0.94)' : 'scale(1.0)',
              }}
            >
              <Zap className="w-10 h-10 sm:w-12 sm:h-12 mb-1 fill-white drop-shadow-md animate-pulse" />
              <span className="text-2xl sm:text-3xl tracking-tight">생산 터치!</span>
              <span className="text-xs font-mono opacity-90 mt-1 bg-black/20 px-3 py-1 rounded-full">
                +{currentUpgrade.pointsPerTap} 점 획득
              </span>
              <span className="text-[10px] text-white/70 mt-1">
                (동시 터치 가능)
              </span>
            </button>
          </div>

          {/* Earth Resource Reminder bar */}
          <div className="w-full mt-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between text-xs shadow">
            <span className="text-zinc-400">지구 잔여 자원:</span>
            <div className="flex items-center gap-2 font-mono">
              <span
                className={`font-bold ${
                  gameState.resourcePercent < 20
                    ? 'text-red-400 animate-pulse'
                    : gameState.resourcePercent < 50
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {gameState.resourcePercent}%
              </span>
              <span className="text-zinc-500 text-[10px]">(중앙 TV 참조)</span>
            </div>
          </div>
        </main>

        {/* RIGHT SIDE: 4~6단계 기술 업그레이드 */}
        <aside className="w-full md:w-56 lg:w-64 flex flex-col justify-center order-3 shrink-0">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-3 sm:p-3.5 shadow-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1 pb-1 border-b border-zinc-800/80">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>첨단~미래 산업 기술</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-bold">4~6단계</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2">
              {rightUpgrades.map((u) => renderUpgradeCard(u))}
            </div>
          </div>
        </aside>
      </div>

      {/* Subtle Hint Footer */}
      <footer className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800/60 text-center shrink-0">
        <span className="text-[11px] text-zinc-400">
          💡 점수가 모이면 <strong className="text-amber-300">좌우 양옆의 업그레이드 버튼</strong>을 눌러 생산량을 폭발적으로 높이세요!
        </span>
      </footer>
    </div>
  );
};
