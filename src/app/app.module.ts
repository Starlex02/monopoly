import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameSessionComponent } from './game-session/game-session.component';
import { MonopolyCardComponent } from './monopoly-card/monopoly-card.component';

@NgModule({
  declarations: [
    AppComponent,
    GameSessionComponent,
    MonopolyCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
