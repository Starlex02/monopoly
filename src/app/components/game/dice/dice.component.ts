import { Component, ElementRef, ViewChild } from '@angular/core';
import { GameSessionService } from 'src/app/services/game-session/game-session.service';
import { WebSocketService } from 'src/app/services/web-socket/web-socket.service';

@Component({
  selector: 'game-dice',
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.css']
})
export class DiceComponent {
  showDice:boolean = false;
  
  @ViewChild('dice1') dice1Ref!: ElementRef;
  @ViewChild('dice2') dice2Ref!: ElementRef;

  constructor( private webSocketService: WebSocketService ) { }

  ngOnInit() {
    this.webSocketService.getDiceNumber().subscribe((diceInfo: []) => {
      this.rollDice(diceInfo);
    });
  }

  rollDice(diceInfo: any) {
    const [random1, random2, currentPlayer, doubleCheck]: [number, number, boolean, boolean] = diceInfo;
    this.showDice = true;

    const dice1 = this.dice1Ref?.nativeElement;
    const dice2 = this.dice2Ref?.nativeElement;

    dice1.classList.add('dice-' + random1);
    dice2.classList.add('dice-' + random2);
    
    setTimeout(()=>{
      this.showDice = false;
      
      dice1.classList.remove('dice-' + random1);
      dice2.classList.remove('dice-' + random2);
      if(currentPlayer) {
        this.webSocketService.emit('moveToken', [random1, random2, doubleCheck]);
      }
    }, 1500)
  }
}