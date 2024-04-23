import { Component } from '@angular/core';
import { WebSocketService } from 'src/app/services/web-socket/web-socket.service';

@Component({
  selector: 'game-dice',
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.css']
})
export class DiceComponent {
  showDice = false;
  
  constructor( private webSocketService: WebSocketService ) { }

  ngOnInit() {    
    this.webSocketService.showDice().subscribe((message: []) => {
      this.showDice = true;
    }); 
  }

  rollDice() {
    const random = Math.floor(Math.random() * 12) + 1;
    console.log('Кинув кубик з числом', random);
    this.showDice = false;
    this.webSocketService.emit('moveToken', random);
  }
}