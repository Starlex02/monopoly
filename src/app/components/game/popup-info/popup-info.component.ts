import { Component, Input } from '@angular/core';
import { elementAt } from 'rxjs';
import { GameSessionService } from 'src/app/services/game-session/game-session.service';
import { WebSocketService } from 'src/app/services/web-socket/web-socket.service';

@Component({
  selector: 'game-popup-info',
  templateUrl: './popup-info.component.html',
  styleUrls: ['./popup-info.component.css']
})
export class PopupInfoComponent {
  popupInfo: any;
  showPopup: boolean = false;
  playerBalance: number = 0;
  cells: any;

  constructor( private webSocketService: WebSocketService, private gameSessionService: GameSessionService) { }

  ngOnInit() {    
    this.webSocketService.getBoardCells().subscribe((message: []) => {
      this.cells = message;

      const currentPlayer = this.gameSessionService.playersInfo.find((player: any) => player.player_id === this.webSocketService.socket.id);
      this.playerBalance = currentPlayer ? currentPlayer.balance : null;

      const currentCell = this.cells.find((element: any) => element.id === currentPlayer.cell_id)

      if(this.popupInfo && this.popupInfo.cash === 0) {
        this.popupInfo.cash = currentCell.rent ? currentCell.rent : currentCell.cost
      }
    }); 

    this.webSocketService.showPlayerInfo().subscribe((message: any) => {
      const currentPlayer = this.gameSessionService.playersInfo.find((player: any) => player.player_id === this.webSocketService.socket.id);
      this.playerBalance = currentPlayer ? currentPlayer.balance : null;

      const currentCell = this.cells.find((element: any) => element.id === currentPlayer.cell_id)

      if(message.cash === 0) {
        message.cash = currentCell.rent ? currentCell.rent : currentCell.cost
      }

      this.popupInfo = message;

      this.gameSessionService.showPopup = true;
      this.gameSessionService.showBuyBranchButton = true;
      this.showPopup = true;
    }); 
  }

  handleButtonClick(action : string) {
    switch (action) {
      case 'throwDice' :
        this.throwDice();
        break;
      case 'nextTurn' :
        this.nextTurn();
        break; 
      case 'buyCell' : 
        this.buyCell();
        break;
      case 'rentCell' : 
        this.rentCell();
        break;
      case 'getCash' :
        this.getCash();
        break;
      case 'payCash' :
        this.payCash();
        break;
      case 'payOff' :
        this.payOff();
        break;
      case 'checkLuck' :
        this.checkLuck();
        break;
      case 'surrender' :
        this.surrender();
        break;
    }

    this.showPopup = false;
    this.gameSessionService.showPopup = false;
    this.gameSessionService.showBuyBranchButton = false;
  }

  surrender() {
    this.showPopup = false;
    this.gameSessionService.showPopup = false;
    this.webSocketService.emit('surrender');
  }

  payOff() {
    this.webSocketService.emit('payOff', this.popupInfo.cash);
  }

  checkLuck() {
    this.webSocketService.emit('throwDice', true);
  }

  payCash() {
    this.webSocketService.emit('payCash', this.popupInfo.cash);
  }

  getCash() {
    this.webSocketService.emit('getCash', this.popupInfo.cash);
  }

  throwDice() {
    this.webSocketService.emit('throwDice', false);
  }

  nextTurn() {
    this.webSocketService.emit('nextTurn');
  }

  buyCell() {
    this.webSocketService.emit('buyCell');
  }

  rentCell() {
    this.webSocketService.emit('rentCell');
  }
}
