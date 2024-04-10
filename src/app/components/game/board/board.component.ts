import { Component } from '@angular/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
  cells: any[] = []; // Дані про клітинки поля

  ngOnInit() {
    // Додайте ваші дані про клітинки поля
    this.cells = [
      { name: '', type: 'start'},
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'chance', pos: 'top' },
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'chance', pos: 'top' },
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'chance', pos: 'top' },
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'prison' },
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'empty'},
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'chance', pos: 'side' },
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'chance', pos: 'side' },
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'chance', pos: 'side' },
      { name: '', type: 'chance', pos: 'side' },
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'monopoly', pos: 'side' },
      { name: '', type: 'prison' },
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'chance', pos: 'top' },
      { name: '', type: 'monopoly', pos: 'top' },
      { name: '', type: 'jackpot' },
    ];
  }
}
