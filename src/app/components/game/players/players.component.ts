import { Component } from '@angular/core';
import { WebSocketService } from '../../../services/web-socket/web-socket.service';

@Component({
  selector: 'body-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent {
  playersInfo: any[] = [];

  constructor(private webSocketService: WebSocketService) { }

  ngOnInit() {    
    this.webSocketService.placeNewPlayer().subscribe((newPlayerInfo: []) => {
      this.playersInfo = newPlayerInfo;
      console.log(this.playersInfo)
    }); 
  }
}
