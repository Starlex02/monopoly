import { Component, Input } from '@angular/core';
import { GameSessionService } from 'src/app/services/game-session/game-session.service';

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
    let cell = document.getElementById(`cell-${this.playerInfo.cell_id}`);
    if (cell) {
      let cellPos = cell.getBoundingClientRect();
      this.playerInfo.x = cellPos.left + cellPos.width / 2 - 7.5 + 'px';
      this.playerInfo.y = cellPos.top + cellPos.height / 2 - 7.5 + 'px';
    }
  }
}
