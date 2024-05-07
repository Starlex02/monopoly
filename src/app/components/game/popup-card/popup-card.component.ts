import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameSessionService } from 'src/app/services/game-session/game-session.service';
import { WebSocketService } from 'src/app/services/web-socket/web-socket.service';

@Component({
  selector: 'game-popup-card',
  templateUrl: './popup-card.component.html',
  styleUrls: ['./popup-card.component.css']
})
export class PopupCardComponent {
  @Input() data: any;
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();
  @Input() playerBalance: number = 0;
  
  constructor(private webSocketService: WebSocketService, private gameSessionService: GameSessionService) {}

  buyOrSellBranch(action: string) {
    switch (action) {
      case 'buyBranch': 
        this.webSocketService.emit('buyBranch', this.data.id);
        this.gameSessionService.showBuyBranchButton = false;
        break;
      case 'sellBranch': 
        this.webSocketService.emit('sellBranch', this.data.id);
        break;
    }

    this.closePopup.emit();
  }
}
