import { Component } from '@angular/core';
import { WebSocketService } from '../../services/web-socket/web-socket.service';
import { tokenPos } from './token-data';

@Component({
  selector: 'game-session',
  templateUrl: './game-session.component.html',
  styleUrls: ['./game-session.component.css']
})
export class GameSessionComponent {
  positions = tokenPos;

  constructor(private webSocketService: WebSocketService) { 
    // Підключення до WebSocket сервера та встановлення колбека
    this.webSocketService.onConnected(() => {
      // Відправлення повідомлення після успішного підключення
      this.webSocketService.sendMessage('Привіт, це повідомлення від клієнта!');
    });
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.positions.forEach(position => {
        let cell = document.getElementById('cell-' + position.position);
        if(cell){
          let cellPos = cell.getBoundingClientRect();
          position.x = cellPos.left + cellPos.width/2 - 5 + 'px';
          position.y = cellPos.top + cellPos.height/2 - 5 + 'px';
        }
      });
    });
  }
}
