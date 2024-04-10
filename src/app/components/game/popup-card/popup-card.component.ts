import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-popup-card',
  templateUrl: './popup-card.component.html',
  styleUrls: ['./popup-card.component.css']
})
export class PopupCardComponent {
  @Input() data: any;

  constructor() {}
}
