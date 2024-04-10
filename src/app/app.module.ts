import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardComponent } from './components/game/board/board.component';
import { CellComponent } from './components/game/cell/cell.component';
import { PopupCardComponent } from './components/game/popup-card/popup-card.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    CellComponent,
    PopupCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
