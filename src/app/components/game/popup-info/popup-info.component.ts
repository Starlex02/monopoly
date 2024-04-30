import { Component } from '@angular/core';
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

  constructor( private webSocketService: WebSocketService, private gameSessionService: GameSessionService) { }

  ngOnInit() {    
    this.webSocketService.showPlayerInfo().subscribe((message: []) => {
      this.popupInfo = message;

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
    }

    this.showPopup = false;
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
