export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout = 3000;
  private isProduction = process.env.NODE_ENV === 'production';

  constructor(private url: string, private onMessage: (data: any) => void) {}

  connect() {
    try {
      console.log(`Connecting to WebSocket: ${this.url}`);
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`WebSocket Disconnected with code: ${event.code}, reason: ${event.reason}`);
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        // Don't reconnect here, let onclose handle it
      };
    } catch (error) {
      console.error('WebSocket Connection Error:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    // In production, use a more aggressive reconnection strategy
    const maxAttempts = this.isProduction ? this.maxReconnectAttempts : 5;
    
    if (this.reconnectAttempts < maxAttempts) {
      this.reconnectAttempts++;
      const timeout = this.isProduction 
        ? Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000) // Exponential backoff with 30s max
        : this.reconnectTimeout;
        
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts} in ${timeout}ms`);
      
      setTimeout(() => {
        this.connect();
      }, timeout);
    } else {
      console.log('Max reconnection attempts reached, giving up');
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not open, cannot send message');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
} 