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
  isRolling:boolean = false;
  
  @ViewChild('dice1') dice1Ref!: ElementRef;
  @ViewChild('dice2') dice2Ref!: ElementRef;

  constructor( private webSocketService: WebSocketService, private gameSessionService: GameSessionService ) { }

  ngOnInit() {
    this.gameSessionService.showDice$.subscribe((showDice: boolean) => {
      if(this.gameSessionService.showDice){
        this.showDice = true;
        this.gameSessionService.showDice = false;
        this.rollDice();
      }
    });
  }

  rollDice() {
    if(this.isRolling) {
      return;
    }

    this.showDice = true;
    this.isRolling = true;

    const dice1 = this.dice1Ref?.nativeElement;
    const dice2 = this.dice2Ref?.nativeElement;

    const random1 = Math.floor(Math.random() * 6) + 1;
    const random2 = Math.floor(Math.random() * 6) + 1;

    dice1.classList.add('dice-' + random1);
    dice2.classList.add('dice-' + random2);
    setTimeout(()=>{
      this.showDice = false;
      this.isRolling = false;
      
      dice1.classList.remove('dice-' + random1);
      dice2.classList.remove('dice-' + random2);
      this.webSocketService.emit('moveToken', [random1, random2]);
    }, 1500)
  }
}