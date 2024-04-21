import { Component } from '@angular/core';
import { WebSocketService } from 'src/app/services/web-socket/web-socket.service';
import { GameSessionService } from 'src/app/services/game-session/game-session.service';

@Component({
  selector: 'game-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
  cells: any[] = [];
  popupVisible = false;
  popupData: any;

  constructor(private webSocketService: WebSocketService, private gameSessionService: GameSessionService) { }

  ngOnInit() {    
    this.webSocketService.getBoardCells().subscribe((message: []) => {
      this.cells = message;
    }); 
  }


  showPopup(cell: any) {
    this.popupData = cell;
    if (this.popupData.type === 'monopoly') {
      this.popupVisible = !this.popupVisible;
    } else {
      this.popupVisible = false;
    }
  }
}
