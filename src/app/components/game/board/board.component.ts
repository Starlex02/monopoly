import { Component } from '@angular/core';
import { WebSocketService } from '../../../services/web-socket/web-socket.service';

@Component({
  selector: 'game-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
  cells: any[] = [];
  popupVisible = false;
  popupData: any;

  constructor(private webSocketService: WebSocketService) { }

  ngOnInit() {
    this.webSocketService.emit('getBoardCells');
    
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
