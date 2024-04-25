import { Component } from '@angular/core';
import { WebSocketService } from 'src/app/services/web-socket/web-socket.service';

@Component({
  selector: 'game-popup-info',
  templateUrl: './popup-info.component.html',
  styleUrls: ['./popup-info.component.css']
})
export class PopupInfoComponent {
  popupInfo: any;
  showPopup: boolean = false;

  constructor( private webSocketService: WebSocketService ) { }

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
      case 'buyCell' : {
        this.buyCell();
        break;
      }
    }

    this.showPopup = false;
  }

  throwDice() {
    const random = Math.floor(Math.random() * 12) + 1;
    console.log('Кинув кубик з числом', random);
    this.webSocketService.emit('moveToken', random);
  }

  nextTurn() {
    this.webSocketService.emit('nextTurn');
  }

  buyCell() {
    this.webSocketService.emit('buyCell');
  }
}
