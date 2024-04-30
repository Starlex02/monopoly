import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameSessionService {
  private cellsInfoSubject = new BehaviorSubject<boolean>(false);
  cellsInfo$: Observable<boolean> = this.cellsInfoSubject.asObservable();
  
  playersInfo: any;
  cellsLength: number = 0;

  set cellsInfo(value: boolean) {
    this.cellsInfoSubject.next(value);
  }

  get cellsInfo(): boolean {
    return this.cellsInfoSubject.value;
  }
  
  constructor() { }
}
