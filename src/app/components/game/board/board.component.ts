import { Component } from '@angular/core';
import { GameSessionService } from 'src/app/services/game-session/game-session.service';
import { WebSocketService } from 'src/app/services/web-socket/web-socket.service';

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
    if( this.gameSessionService.showPopup ) {
      const buttonsBranch: any[] = [];
      
      if( cell.is_owner ){
        if( cell.base_rent < cell.rent && cell.rent < cell.rent_5 && this.gameSessionService.showBuyBranchButton && cell.allow_buy_branch ){
          buttonsBranch.push({"label" : "Купити філіал", "action" : "buyBranch"});
        }
        if( cell.rent_0 < cell.rent ) {
          buttonsBranch.push({"label" : "Продати філіал", "action" : "sellBranch"});
        }
      }

      cell.buttons = buttonsBranch;
    }

    this.popupData = cell;
    if (this.popupData.type === 'monopoly') {
      this.popupVisible = !this.popupVisible;
    } else {
      this.popupVisible = false;
    }
  }

  onClosePopup() {
    this.popupVisible = false;
  }
}
