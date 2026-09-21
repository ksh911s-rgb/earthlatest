import { io, Socket } from 'socket.io-client';
import { GameState, ProducePayload, UpgradePayload, AdminConfigPayload } from '../types';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function joinTeam(teamId: string, teamName?: string) {
  const s = getSocket();
  s.emit('team:join', { teamId, teamName });
}

export function setTeamReady(teamId: string, isReady: boolean) {
  const s = getSocket();
  s.emit('team:ready', { teamId, isReady });
}

export function producePoints(payload: ProducePayload) {
  const s = getSocket();
  s.emit('team:produce', payload);
}

export function purchaseUpgrade(payload: UpgradePayload) {
  const s = getSocket();
  s.emit('team:upgrade', payload);
}

export function adminStartGame() {
  const s = getSocket();
  s.emit('admin:start');
}

export function adminPauseGame() {
  const s = getSocket();
  s.emit('admin:pause');
}

export function adminResumeGame() {
  const s = getSocket();
  s.emit('admin:resume');
}

export function adminResetGame(maxResource?: number) {
  const s = getSocket();
  s.emit('admin:reset', { maxResource });
}

export function adminUpdateConfig(config: AdminConfigPayload) {
  const s = getSocket();
  s.emit('admin:config', config);
}

export function adminSetStatus(status: GameState['status']) {
  const s = getSocket();
  s.emit('admin:set_status', { status });
}
