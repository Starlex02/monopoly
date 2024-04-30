import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameSessionService {
  private cellsInfoSubject = new BehaviorSubject<boolean>(false);
  cellsInfo$: Observable<boolean> = this.cellsInfoSubject.asObservable();

  private showDiceSubject = new BehaviorSubject<boolean>(false);
  showDice$: Observable<boolean> = this.showDiceSubject.asObservable();
  
  playersInfo: any;
  cellsLength: number = 0;
  doubleCheck: boolean = false;

  set cellsInfo(value: boolean) {
    this.cellsInfoSubject.next(value);
  }

  get cellsInfo(): boolean {
    return this.cellsInfoSubject.value;
  }

  set showDice(value: boolean) {
    this.showDiceSubject.next(value);
  }

  get showDice(): boolean {
    return this.showDiceSubject.value;
  }

  constructor() { }
}
