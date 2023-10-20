import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonopolyCardComponent } from './monopoly-card.component';

describe('MonopolyCardComponent', () => {
  let component: MonopolyCardComponent;
  let fixture: ComponentFixture<MonopolyCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonopolyCardComponent]
    });
    fixture = TestBed.createComponent(MonopolyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
