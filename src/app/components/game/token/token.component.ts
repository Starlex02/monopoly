import { Component, Input } from '@angular/core';

@Component({
  selector: 'player-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.css']
})
export class TokenComponent {
  @Input() playerInfo: any;

  ngOnInit() {
    this.setStartPosition();
  }

  setStartPosition() {
    let cell = document.getElementById('cell-1');
    if (cell) {
      let cellPos = cell.getBoundingClientRect();
      this.playerInfo.x = cellPos.left + cellPos.width / 2 - 5 + 'px';
      this.playerInfo.y = cellPos.top + cellPos.height / 2 - 5 + 'px';
    }
  }
}
