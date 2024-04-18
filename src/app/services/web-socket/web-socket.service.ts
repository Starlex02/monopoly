import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket;
  private connectedCallback!: () => void;

  constructor() {
    this.socket = new WebSocket('ws://localhost:4201');
    
    this.socket.onopen = () => {
      console.log('Connected to server');
      if (this.connectedCallback) {
        this.connectedCallback(); // Викликаємо колбек після успішного підключення
      }
    };

    this.socket.onmessage = (event) => {
      console.log(`Received message: ${event.data}`);
    };

    this.socket.onclose = () => {
      console.log('Connection closed');
    };
  }

  connect() {
    this.socket.onopen = () => {
      this.socket.send('message');
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

  onConnected(callback: () => void) {
    this.connectedCallback = callback;
  }
}
