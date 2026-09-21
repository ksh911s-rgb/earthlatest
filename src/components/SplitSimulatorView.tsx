import React, { useState } from 'react';
import { GameState } from '../types';
import { CentralTvScreen } from './CentralTvScreen';
import { StudentTabletScreen } from './StudentTabletScreen';
import { CountryFlag } from './CountryFlag';
import { Monitor, Tablet, Layers } from 'lucide-react';

interface SplitSimulatorViewProps {
  gameState: GameState;
  onOpenTeacherControl: () => void;
  onOpenDebriefing: () => void;
}

export const SplitSimulatorView: React.FC<SplitSimulatorViewProps> = ({
  gameState,
  onOpenTeacherControl,
  onOpenDebriefing,
}) => {
  const [activeTabTeam, setActiveTabTeam] = useState('team-1');

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Simulator Mode Bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-xs z-30">
        <div className="flex items-center space-x-2 text-zinc-300">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="font-bold">교실 통합 시뮬레이터 모드</span>
          <span className="text-zinc-500 hidden sm:inline">
            (상단: 교실 중앙 TV / 하단: 6개 모둠 태블릿 인터랙티브 조작)
          </span>
        </div>

        {/* Team Selector Tabs for bottom tablet */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          <span className="text-zinc-400 text-[11px] mr-1 hidden sm:inline">조작 모둠:</span>
          {Object.keys(gameState.teams).map((tid) => {
            const t = gameState.teams[tid];
            const isActive = activeTabTeam === tid;
            return (
              <button
                key={tid}
                onClick={() => setActiveTabTeam(tid)}
                className={`px-2 py-1 rounded-lg font-bold text-xs transition whitespace-nowrap flex items-center gap-1 ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
                style={isActive ? { backgroundColor: t.color } : {}}
              >
                <CountryFlag countryId={tid} size="xs" rounded="sm" />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Split Grid: Central TV on Left/Top, Tablet on Right/Bottom */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-y-auto">
        {/* Central TV View (Left / Top) */}
        <div className="xl:col-span-7 border-b xl:border-b-0 xl:border-r border-zinc-800 flex flex-col">
          <div className="bg-zinc-950 px-3 py-1.5 border-b border-zinc-800/80 text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span>중앙 TV 화면 (프로젝터 송출 화면)</span>
          </div>
          <div className="flex-1">
            <CentralTvScreen
              gameState={gameState}
              onOpenTeacherControl={onOpenTeacherControl}
              onOpenDebriefing={onOpenDebriefing}
            />
          </div>
        </div>

        {/* Student Tablet View (Right / Bottom) */}
        <div className="xl:col-span-5 flex flex-col bg-zinc-950">
          <div className="bg-zinc-900 px-3 py-1.5 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tablet className="w-3.5 h-3.5 text-emerald-400" />
              <CountryFlag countryId={activeTabTeam} size="xs" rounded="sm" />
              <span>학생 모둠 태블릿 ({gameState.teams[activeTabTeam]?.name})</span>
            </div>
            <span className="text-zinc-500 text-[10px]">
              * 버튼을 광클하여 중앙 TV의 자원이 줄어드는 모습을 관찰하세요
            </span>
          </div>
          <div className="flex-1 relative">
            <StudentTabletScreen
              key={activeTabTeam}
              gameState={gameState}
              initialTeamId={activeTabTeam}
              onSwitchToTv={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
