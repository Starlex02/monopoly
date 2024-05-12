import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  public socket: Socket;

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

  emit(func: string, message?: any) {
    if (message !== undefined) {
      this.socket.emit(func, message);
    } else {
      this.socket.emit(func);
    }
  }

  disconnect() {
    this.socket.disconnect();
  }

  getBoardCells(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('getBoardCells', (data: any) => {
        observer.next(data);
      });
    });
  }

  placeNewPlayer() {
    return new Observable<any>(observer => {
      this.socket.on('placeNewPlayer', (data: any) => {
        observer.next(data);
      });
    });
  }

  timer() {
    return new Observable<any>(observer => {
      this.socket.on('timer', (data: any) => {
        observer.next(data);
      });
    });
  }

  showPlayerInfo() {
    return new Observable<any>(observer => {
      this.socket.on('showPlayerInfo', (data: any) => {
        observer.next(data);
      });
    });
  }

  getDiceNumber() {
    return new Observable<any>(observer => {
      this.socket.on('throwDice', (data: any) => {
        observer.next(data);
      });
    });
  }
}
