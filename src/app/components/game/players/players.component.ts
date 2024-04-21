import { Component } from '@angular/core';
import { WebSocketService } from 'src/app/services/web-socket/web-socket.service';
import { GameSessionService } from 'src/app/services/game-session/game-session.service';

@Component({
  selector: 'body-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent {
  playersInfo: any[] = [];

  constructor(private webSocketService: WebSocketService, private gameSessionService: GameSessionService) { }

  ngOnInit() {
    this.webSocketService.placeNewPlayer().subscribe((newPlayerInfo: []) => {
      this.playersInfo = newPlayerInfo;
      this.gameSessionService.playersInfo = newPlayerInfo;

      this.webSocketService.emit('getBoardCells');
    });
  }
}

