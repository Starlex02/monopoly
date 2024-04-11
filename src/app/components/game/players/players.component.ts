import { Component } from '@angular/core';
import { playersInfo } from './players-data';

@Component({
  selector: 'body-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent {
  playersInfo: any[] = playersInfo;
}
