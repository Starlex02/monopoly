import { Component } from '@angular/core';
import { WebSocketService } from 'src/app/services/web-socket/web-socket.service';
import { GameSessionService } from 'src/app/services/game-session/game-session.service';

@Component({
  selector: 'game-session',
  templateUrl: './game-session.component.html',
  styleUrls: ['./game-session.component.css']
})
export class GameSessionComponent {
  playersInfo: any[] = [];

  constructor(private webSocketService: WebSocketService, private gameSessionService: GameSessionService) { }

  ngOnInit() {
    this.gameSessionService.cellsInfo$.subscribe(() => {
      this.playersInfo = this.gameSessionService.playersInfo;
    });
  }

}
