import { Component, Input } from '@angular/core';

@Component({
  selector: 'player-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.css']
})
export class TokenComponent {
  @Input() position: any;
}
