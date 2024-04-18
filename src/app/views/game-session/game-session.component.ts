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

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    // Підключення до WebSocket сервера та встановлення колбека
    this.webSocketService.emit('message','Привіт, це повідомлення від клієнта!');

    this.webSocketService.onMessage().subscribe((message: string) => {
      console.log(message);
    });

    this.webSocketService.onTest().subscribe((message: string) => {
      console.log(message);
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
