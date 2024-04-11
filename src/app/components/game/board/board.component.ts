import { Component } from '@angular/core';
import { boardCells } from './board-data';

@Component({
  selector: 'game-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
  cells: any[] = boardCells; // Дані про клітинки поля
  popupVisible = false;
  popupData: any;

  showPopup(cell: any) {
    this.popupData = cell;
    this.popupVisible = !this.popupVisible;
  }
}
