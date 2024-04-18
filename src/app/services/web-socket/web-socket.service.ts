import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('ws://localhost:4201');
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('message', (data: any) => {
      console.log(`Received message: ${data}`);
    });

    this.socket.on('disconnect', () => {
      console.log('Connection closed');
    });
  }

  emit(func: string, message: string) {
    this.socket.emit(func, message);
  }

  disconnect() {
    this.socket.disconnect();
  }

  // onConnected(callback: () => void) {
  //   this.socket.on('connect', callback);
  // }

  onMessage(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('message', (data: any) => {
        observer.next(data);
      });
    });
  }

  onTest(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('test', (data: any) => {
        observer.next(data);
      });
    });
  }
}
