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

    this.webSocketService.timer().subscribe((message: any) => {
      const targetPlayerIndex = this.playersInfo.findIndex((player: any) => player.player_id === message[1])
      this.playersInfo[targetPlayerIndex]['timer'] = message[0];
    });
  }
}

