import { io, Socket } from 'socket.io-client';
import type { TurnAction, GameState } from '@/types/game';

// Events the client sends to server
export interface ClientToServerEvents {
  'match:join': (data: { playerId: string; displayName: string; elo: number }) => void;
  'match:leave': (matchId: string) => void;
  'match:ready': (matchId: string) => void;
  'game:action': (data: { matchId: string; action: TurnAction }) => void;
  'game:syncRequest': (matchId: string) => void;
}

// Events the server sends to client
export interface ServerToClientEvents {
  'match:found': (data: { matchId: string; opponentName: string; opponentElo: number }) => void;
  'match:opponentReady': () => void;
  'match:start': (initialState: GameState) => void;
  'match:opponentLeft': () => void;
  'game:actionBroadcast': (action: TurnAction) => void;
  'game:stateSync': (state: GameState) => void;
  'game:over': (data: { winnerId: string }) => void;
  'error': (message: string) => void;
}

type HexoriaSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketService {
  private socket: HexoriaSocket | null = null;
  private serverUrl: string = 'wss://api.hexoria.game'; // replace with real server

  connect(serverUrl?: string): HexoriaSocket {
    if (this.socket?.connected) return this.socket;

    if (serverUrl) this.serverUrl = serverUrl;

    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    }) as HexoriaSocket;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  get(): HexoriaSocket | null {
    return this.socket;
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  emit<K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ) {
    if (!this.socket) {
      console.warn('[Socket] Cannot emit — not connected');
      return;
    }
    (this.socket.emit as Function)(event, ...args);
  }

  on<K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(event as string, handler as any);
    return () => this.socket?.off(event as string, handler as any);
  }
}

export const socketService = new SocketService();
