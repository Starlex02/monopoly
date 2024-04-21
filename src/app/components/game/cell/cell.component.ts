import { Component, Input } from '@angular/core';
import { GameSessionService } from 'src/app/services/game-session/game-session.service';

@Component({
  selector: 'game-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css']
})
export class CellComponent {
  @Input() cell: any;

  constructor(private gameSessionService: GameSessionService) { }

  ngOnInit() {
    setTimeout(() => {
      if (this.gameSessionService.cellsLength === 40) {
        this.gameSessionService.cellsInfo = true;
      } else {
        this.gameSessionService.cellsLength++;
      }
    });
  }
}


