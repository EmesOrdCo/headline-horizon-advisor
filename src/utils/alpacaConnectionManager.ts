// Global cleanup manager for Alpaca WebSocket connections
class AlpacaConnectionCleanup {
  private static instance: AlpacaConnectionCleanup | null = null;
  private connections: Set<WebSocket> = new Set();

  static getInstance(): AlpacaConnectionCleanup {
    if (!AlpacaConnectionCleanup.instance) {
      AlpacaConnectionCleanup.instance = new AlpacaConnectionCleanup();
      
      // Add page unload cleanup
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          AlpacaConnectionCleanup.instance?.cleanup();
        });
        
        // Add visibility change cleanup (when tab becomes hidden)
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            AlpacaConnectionCleanup.instance?.cleanup();
          }
        });
      }
    }
    return AlpacaConnectionCleanup.instance;
  }

  addConnection(ws: WebSocket) {
    this.connections.add(ws);
  }

  removeConnection(ws: WebSocket) {
    this.connections.delete(ws);
  }

  cleanup() {
    console.log(`🧹 Cleaning up ${this.connections.size} Alpaca WebSocket connections`);
    this.connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, "Page unload cleanup");
      }
    });
    this.connections.clear();
  }

  getActiveConnectionCount(): number {
    // Clean up closed connections
    this.connections.forEach(ws => {
      if (ws.readyState === WebSocket.CLOSED) {
        this.connections.delete(ws);
      }
    });
    return this.connections.size;
  }
}

export const alpacaCleanup = AlpacaConnectionCleanup.getInstance();