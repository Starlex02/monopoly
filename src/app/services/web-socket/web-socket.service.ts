import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket;

  constructor() {
    this.socket = new WebSocket('ws://localhost:4201');
  }

  connect() {
    this.socket.onopen = () => {
      console.log('Connected to server');
    };

    this.socket.onmessage = (event) => {
      console.log(`Received message: ${event.data}`);
    };

    this.socket.onclose = () => {
      console.log('Connection closed');
    };
  }

  disconnect() {
    this.socket.close();
  }

  sendMessage(message: string) {
    this.socket.send(message);
  }
}
