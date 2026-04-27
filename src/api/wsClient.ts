import { WS_BASE } from "./client";

export interface BackendEvent {
  type: string;
  payload: Record<string, unknown>;
}

export type EventHandler = (e: BackendEvent) => void;

export class WsClient {
  private url: string;
  private socket: WebSocket | null = null;
  private handlers = new Set<EventHandler>();
  private reconnectTimer: number | null = null;
  private closedByUser = false;

  constructor(path = "/ws/events") {
    this.url = `${WS_BASE}${path}`;
  }

  connect() {
    this.closedByUser = false;
    this.openSocket();
  }

  close() {
    this.closedByUser = true;
    if (this.reconnectTimer != null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
  }

  on(handler: EventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private openSocket() {
    try {
      const ws = new WebSocket(this.url);
      this.socket = ws;
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as BackendEvent;
          this.handlers.forEach((h) => h(data));
        } catch {
          /* ignore */
        }
      };
      ws.onclose = () => {
        this.socket = null;
        if (!this.closedByUser) this.scheduleReconnect();
      };
      ws.onerror = () => {
        ws.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer != null) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.closedByUser) this.openSocket();
    }, 2000);
  }
}

export const wsClient = new WsClient();
