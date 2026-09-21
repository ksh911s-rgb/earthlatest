import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import {
  GameState,
  ProducePayload,
  UpgradePayload,
  AdminConfigPayload,
} from './src/types';
import { DEFAULT_MAX_RESOURCE, INITIAL_TEAMS, UPGRADES, TEACHER_PASSWORD } from './src/utils/constants';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// In-Memory Authoritative Game Session
let gameState: GameState = {
  status: 'waiting',
  maxResource: DEFAULT_MAX_RESOURCE,
  currentResource: DEFAULT_MAX_RESOURCE,
  resourcePercent: 100,
  totalClicks: 0,
  consumptionRate: 0,
  elapsedSeconds: 0,
  startedAt: null,
  endedAt: null,
  teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
  isBotEnabled: false,
  history: [],
  roomCode: 'EARTH-2026',
};

// Tracking for rate calculation
let lastResourceCheckTime = Date.now();
let lastResourceSnapshot = gameState.currentResource;
let lastHistoryRecordTime = 0;

function resetGame(newMaxResource?: number) {
  const max = newMaxResource || gameState.maxResource || DEFAULT_MAX_RESOURCE;
  const initialTeams = JSON.parse(JSON.stringify(INITIAL_TEAMS));
  if (gameState.isBotEnabled) {
    Object.values(initialTeams).forEach((t: any) => {
      t.isReady = true;
      t.activeMembers = 1;
    });
  }
  gameState = {
    status: 'waiting',
    maxResource: max,
    currentResource: max,
    resourcePercent: 100,
    totalClicks: 0,
    consumptionRate: 0,
    elapsedSeconds: 0,
    startedAt: null,
    endedAt: null,
    teams: initialTeams,
    isBotEnabled: gameState.isBotEnabled,
    history: [],
    roomCode: 'EARTH-2026',
  };
  lastResourceCheckTime = Date.now();
  lastResourceSnapshot = max;
  lastHistoryRecordTime = 0;
}

// Socket.io Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

function broadcastState() {
  io.emit('game:state', gameState);
}

function triggerBlackout() {
  if (gameState.status === 'blackout') return;
  gameState.status = 'blackout';
  gameState.currentResource = 0;
  gameState.resourcePercent = 0;
  gameState.endedAt = Date.now();

  // Add final snapshot
  const teamScores: Record<string, number> = {};
  const teamTiers: Record<string, string> = {};
  for (const tid of Object.keys(gameState.teams)) {
    teamScores[tid] = gameState.teams[tid].score;
    teamTiers[tid] = gameState.teams[tid].currentUpgradeId;
  }
  gameState.history.push({
    timestamp: Date.now(),
    resourcePercent: 0,
    resourceRemaining: 0,
    totalScore: Object.values(teamScores).reduce((a, b) => a + b, 0),
    teamScores,
    teamTiers,
    totalClicks: gameState.totalClicks,
  });

  io.emit('game:blackout', {
    message: '자원이 고갈되어 모든 공장 가동이 중단되었습니다.',
    endedAt: gameState.endedAt,
  });
  broadcastState();
}

io.on('connection', (socket) => {
  // Send immediate initial state
  socket.emit('game:state', gameState);

  // Team joins
  socket.on('team:join', (payload: { teamId: string; teamName?: string }) => {
    const { teamId, teamName } = payload;
    if (gameState.teams[teamId]) {
      if (teamName && teamName.trim()) {
        gameState.teams[teamId].name = teamName.trim();
      }
      gameState.teams[teamId].activeMembers = Math.max(1, (gameState.teams[teamId].activeMembers || 0) + 1);
      gameState.teams[teamId].isReady = true;
      socket.join(teamId);
      broadcastState();
    }
  });

  // Team Ready State Toggle
  socket.on('team:ready', (payload: { teamId: string; isReady: boolean }) => {
    const { teamId, isReady } = payload;
    if (gameState.teams[teamId]) {
      gameState.teams[teamId].isReady = isReady;
      if (!isReady && gameState.teams[teamId].activeMembers > 0) {
        gameState.teams[teamId].activeMembers = Math.max(0, gameState.teams[teamId].activeMembers - 1);
      }
      broadcastState();
    }
  });

  // Rapid Click / Production
  socket.on('team:produce', (payload: ProducePayload) => {
    if (gameState.status !== 'playing') return;
    const { teamId, clicks } = payload;
    const team = gameState.teams[teamId];
    if (!team) return;

    const validatedClicks = Math.max(1, Math.min(clicks || 1, 50)); // clamp batch
    const upgrade = UPGRADES.find((u) => u.id === team.currentUpgradeId) || UPGRADES[0];

    const pointsEarned = validatedClicks * upgrade.pointsPerTap;
    const resourceConsumed = validatedClicks * upgrade.resourceCostPerTap;

    team.score += pointsEarned;
    team.tapCount += validatedClicks;
    team.lastTapTimestamp = Date.now();
    gameState.totalClicks += validatedClicks;

    gameState.currentResource = Math.max(0, gameState.currentResource - resourceConsumed);
    gameState.resourcePercent = Number(((gameState.currentResource / gameState.maxResource) * 100).toFixed(1));

    if (gameState.currentResource <= 0) {
      triggerBlackout();
    }
  });

  // Upgrade Purchase
  socket.on('team:upgrade', (payload: UpgradePayload) => {
    if (gameState.status !== 'playing') return;
    const { teamId, upgradeId } = payload;
    const team = gameState.teams[teamId];
    const targetUpgrade = UPGRADES.find((u) => u.id === upgradeId);
    if (!team || !targetUpgrade) return;

    if (team.score >= targetUpgrade.cost) {
      team.score -= targetUpgrade.cost;
      team.currentUpgradeId = upgradeId;
      team.upgradesPurchased[upgradeId] = (team.upgradesPurchased[upgradeId] || 0) + 1;

      // Broadcast update immediately on upgrade
      broadcastState();
      socket.emit('team:upgrade_success', { upgradeId });
    } else {
      socket.emit('team:upgrade_fail', { reason: '점수가 부족합니다.' });
    }
  });

  // Admin / Teacher Controls
  socket.on('admin:start', () => {
    if (gameState.status === 'blackout') {
      resetGame();
    }
    gameState.status = 'playing';
    if (!gameState.startedAt) {
      gameState.startedAt = Date.now();
      const initialScores: Record<string, number> = {};
      const initialTiers: Record<string, string> = {};
      for (const tid of Object.keys(gameState.teams)) {
        initialScores[tid] = 0;
        initialTiers[tid] = 'tier-1';
      }
      gameState.history = [
        {
          timestamp: Date.now(),
          resourcePercent: 100,
          resourceRemaining: gameState.maxResource,
          totalScore: 0,
          teamScores: initialScores,
          teamTiers: initialTiers,
          totalClicks: 0,
        },
      ];
    }
    broadcastState();
  });

  socket.on('admin:pause', () => {
    if (gameState.status === 'playing') {
      gameState.status = 'paused';
      broadcastState();
    }
  });

  socket.on('admin:resume', () => {
    if (gameState.status === 'paused') {
      gameState.status = 'playing';
      broadcastState();
    }
  });

  socket.on('admin:reset', (payload?: { maxResource?: number }) => {
    resetGame(payload?.maxResource);
    broadcastState();
  });

  socket.on('admin:config', (payload: AdminConfigPayload) => {
    if (payload.maxResource && payload.maxResource > 0) {
      gameState.maxResource = payload.maxResource;
      if (gameState.status === 'waiting') {
        gameState.currentResource = payload.maxResource;
        gameState.resourcePercent = 100;
      }
    }
    if (typeof payload.isBotEnabled === 'boolean') {
      gameState.isBotEnabled = payload.isBotEnabled;
      if (payload.isBotEnabled) {
        Object.values(gameState.teams).forEach((t) => {
          t.isReady = true;
          t.activeMembers = Math.max(1, t.activeMembers || 1);
        });
      }
    }
    broadcastState();
  });

  socket.on('admin:set_status', (payload: { status: GameState['status'] }) => {
    gameState.status = payload.status;
    broadcastState();
  });
});

// Periodic Server Tick (every 100ms)
setInterval(() => {
  const now = Date.now();

  if (gameState.status === 'playing') {
    // 1. Elapsed time
    if (gameState.startedAt) {
      gameState.elapsedSeconds = Math.floor((now - gameState.startedAt) / 1000);
    }

    // 2. Passive upgrades & Auto production (1/10th per 100ms tick)
    let passiveResourceDelta = 0;
    for (const tid of Object.keys(gameState.teams)) {
      const team = gameState.teams[tid];
      const upgrade = UPGRADES.find((u) => u.id === team.currentUpgradeId);
      if (upgrade && upgrade.passivePointsPerSec > 0) {
        const points = upgrade.passivePointsPerSec * 0.1;
        const res = upgrade.passiveResourcePerSec * 0.1;
        team.score += points;
        passiveResourceDelta += res;
      }

      // If Bot simulation is enabled, simulate human clicks for unassisted testing
      if (gameState.isBotEnabled) {
        if (Math.random() < 0.45) {
          const clickBatch = Math.floor(Math.random() * 2) + 1;
          const pts = clickBatch * (upgrade ? upgrade.pointsPerTap : 1);
          const rUsed = clickBatch * (upgrade ? upgrade.resourceCostPerTap : 1);
          team.score += pts;
          team.tapCount += clickBatch;
          gameState.totalClicks += clickBatch;
          passiveResourceDelta += rUsed;

          // Bot auto-upgrade if affordable
          const nextUpgradeIdx = UPGRADES.findIndex((u) => u.id === team.currentUpgradeId) + 1;
          if (nextUpgradeIdx < UPGRADES.length) {
            const nextUp = UPGRADES[nextUpgradeIdx];
            if (team.score >= nextUp.cost * 1.1) {
              team.score -= nextUp.cost;
              team.currentUpgradeId = nextUp.id;
              team.upgradesPurchased[nextUp.id] = (team.upgradesPurchased[nextUp.id] || 0) + 1;
            }
          }
        }
      }
    }

    if (passiveResourceDelta > 0) {
      gameState.currentResource = Math.max(0, gameState.currentResource - passiveResourceDelta);
      gameState.resourcePercent = Number(((gameState.currentResource / gameState.maxResource) * 100).toFixed(1));
      if (gameState.currentResource <= 0) {
        triggerBlackout();
        return;
      }
    }

    // 3. Calculate Consumption Rate (every ~1s)
    const timeSinceLastRate = now - lastResourceCheckTime;
    if (timeSinceLastRate >= 1000) {
      const resDiff = Math.max(0, lastResourceSnapshot - gameState.currentResource);
      gameState.consumptionRate = Math.round((resDiff / timeSinceLastRate) * 1000);
      lastResourceCheckTime = now;
      lastResourceSnapshot = gameState.currentResource;
    }

    // 4. Save Debriefing History Snapshot every 1.0 second for smooth 3x replay simulation
    if (now - lastHistoryRecordTime >= 1000) {
      lastHistoryRecordTime = now;
      const teamScores: Record<string, number> = {};
      const teamTiers: Record<string, string> = {};
      let totalScore = 0;
      for (const tid of Object.keys(gameState.teams)) {
        const sc = Math.round(gameState.teams[tid].score);
        teamScores[tid] = sc;
        teamTiers[tid] = gameState.teams[tid].currentUpgradeId;
        totalScore += sc;
      }
      gameState.history.push({
        timestamp: now,
        resourcePercent: gameState.resourcePercent,
        resourceRemaining: Math.round(gameState.currentResource),
        totalScore,
        teamScores,
        teamTiers,
        totalClicks: gameState.totalClicks,
      });
      if (gameState.history.length > 800) {
        gameState.history.shift();
      }
    }

    broadcastState();
  }
}, 100);

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: Date.now() });
});

app.get('/api/game/state', (req, res) => {
  res.json(gameState);
});

app.post('/api/admin/verify-pin', (req, res) => {
  const { pin } = req.body || {};
  if (pin === TEACHER_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: '비밀번호가 일치하지 않습니다.' });
  }
});

// Setup Vite middleware in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🌍 [Earth Game Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
