import { useState, useEffect } from 'react';
import { GameState } from './types';
import { DEFAULT_MAX_RESOURCE, INITIAL_TEAMS } from './utils/constants';
import { getSocket } from './utils/socket';
import { CentralTvScreen } from './components/CentralTvScreen';
import { StudentTabletScreen } from './components/StudentTabletScreen';
import { SplitSimulatorView } from './components/SplitSimulatorView';
import { TeacherControlModal } from './components/TeacherControlModal';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { DebriefingModal } from './components/DebriefingModal';
import { Monitor, Tablet, Layers, Sliders, BookOpen, WifiOff, Lock } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'waiting',
    maxResource: DEFAULT_MAX_RESOURCE,
    currentResource: DEFAULT_MAX_RESOURCE,
    resourcePercent: 100,
    totalClicks: 0,
    consumptionRate: 0,
    elapsedSeconds: 0,
    startedAt: null,
    endedAt: null,
    teams: INITIAL_TEAMS,
    isBotEnabled: false,
    history: [],
    roomCode: 'EARTH-2026',
  });

  const [connected, setConnected] = useState(false);
  const [viewRole, setViewRole] = useState<'tv' | 'student' | 'split'>('student');
  const [activeTeamId, setActiveTeamId] = useState('team-1');
  const [isTeacherControlOpen, setIsTeacherControlOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);
  const [isDebriefingOpen, setIsDebriefingOpen] = useState(false);

  // Read URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    const teamParam = params.get('team');

    if (teamParam) {
      const normalized = teamParam.startsWith('team-') ? teamParam : `team-${teamParam}`;
      setActiveTeamId(normalized);
    }

    // Always start as student unless explicitly authenticated
    if (roleParam === 'student') {
      setViewRole('student');
    }
  }, []);

  // Socket setup
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onStateUpdate = (newState: GameState) => {
      setGameState(newState);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('game:state', onStateUpdate);

    // Initial fetch fallback
    fetch('/api/game/state')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.teams) {
          setGameState(data);
        }
      })
      .catch(() => {});

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('game:state', onStateUpdate);
    };
  }, []);

  const handleSelectRole = (role: 'tv' | 'student' | 'split', teamId?: string) => {
    setViewRole(role);
    if (teamId) {
      setActiveTeamId(teamId);
    }
  };

  const handleOpenTeacherControl = () => {
    if (isTeacherAuthenticated) {
      setIsTeacherControlOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsTeacherAuthenticated(true);
    setIsAuthModalOpen(false);
    setIsTeacherControlOpen(true);
  };

  const isStudentLocked = !isTeacherAuthenticated;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      {/* Top Universal Mode Switcher (Great for Classroom Presentation & Testing) */}
      <nav className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-xs z-40 select-none">
        <div className="flex items-center space-x-2">
          <span className="font-black text-sm text-indigo-400">🌍 지구 발전 게임</span>
          {!connected && (
            <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full">
              <WifiOff className="w-3 h-3" />
              <span>서버 연결 중...</span>
            </span>
          )}
        </div>

        {/* View Mode Pills - Locked to '모둠 태블릿' in student mode */}
        <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            disabled={isStudentLocked}
            onClick={isStudentLocked ? undefined : () => setViewRole('split')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-bold transition ${
              viewRole === 'split'
                ? 'bg-indigo-600 text-white shadow-md'
                : isStudentLocked
                ? 'text-zinc-600 opacity-40 cursor-not-allowed'
                : 'text-zinc-400 hover:text-white'
            }`}
            title={isStudentLocked ? '선생님 관리창에서 인증 후 이용할 수 있습니다' : '통합 시뮬레이터'}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>통합 시뮬레이터</span>
          </button>

          <button
            disabled={isStudentLocked}
            onClick={isStudentLocked ? undefined : () => setViewRole('tv')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-bold transition ${
              viewRole === 'tv'
                ? 'bg-indigo-600 text-white shadow-md'
                : isStudentLocked
                ? 'text-zinc-600 opacity-40 cursor-not-allowed'
                : 'text-zinc-400 hover:text-white'
            }`}
            title={isStudentLocked ? '선생님 관리창에서 인증 후 이용할 수 있습니다' : '중앙 TV 화면'}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>중앙 TV 화면</span>
          </button>

          <button
            onClick={() => setViewRole('student')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-bold transition ${
              viewRole === 'student'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>모둠 태블릿</span>
            {isStudentLocked && <Lock className="w-2.5 h-2.5 ml-1 text-indigo-200 inline" />}
          </button>
        </div>

        {/* Quick Modal Triggers */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenTeacherControl}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
            title="선생님 관리창"
          >
            {isTeacherAuthenticated ? (
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">선생님 관리창</span>
            {!isTeacherAuthenticated && <span className="text-[10px] text-zinc-500 font-mono hidden md:inline">🔒</span>}
          </button>

          {!isStudentLocked && (
            <button
              onClick={() => setIsDebriefingOpen(true)}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold border border-indigo-700/60 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">디브리핑</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col">
        {viewRole === 'split' && (
          <SplitSimulatorView
            gameState={gameState}
            onOpenTeacherControl={handleOpenTeacherControl}
            onOpenDebriefing={() => setIsDebriefingOpen(true)}
          />
        )}

        {viewRole === 'tv' && (
          <CentralTvScreen
            gameState={gameState}
            onOpenTeacherControl={handleOpenTeacherControl}
            onOpenDebriefing={() => setIsDebriefingOpen(true)}
          />
        )}

        {viewRole === 'student' && (
          <StudentTabletScreen
            gameState={gameState}
            initialTeamId={activeTeamId}
          />
        )}
      </div>

      {/* Modals */}
      <TeacherAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <TeacherControlModal
        isOpen={isTeacherControlOpen}
        onClose={() => setIsTeacherControlOpen(false)}
        gameState={gameState}
        onOpenDebriefing={() => {
          setIsTeacherControlOpen(false);
          setIsDebriefingOpen(true);
        }}
        onSelectRole={handleSelectRole}
        onLock={() => {
          setIsTeacherAuthenticated(false);
          setIsTeacherControlOpen(false);
        }}
      />

      <DebriefingModal
        isOpen={isDebriefingOpen}
        onClose={() => setIsDebriefingOpen(false)}
        gameState={gameState}
      />
    </div>
  );
}
