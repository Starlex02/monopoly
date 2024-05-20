import { Component, Input, KeyValueDiffer, KeyValueDiffers } from '@angular/core';

@Component({
  selector: 'player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.css']
})
export class PlayerCardComponent {
  @Input() player: any;

  progress: string = '0';
  private differ: KeyValueDiffer<any, any>;
  strokeColor: any;

  constructor(private differs: KeyValueDiffers) {
    this.differ = this.differs.find({}).create();
  }

  ngDoCheck(): void {
    const changes = this.differ.diff(this.player);
    if (changes) {
      changes.forEachChangedItem(item => {
        if (item.key === 'timer') {
          this.updateProgressAndColor();
        }
      });
    }
  }

  private updateProgressAndColor(): void {
    const timerValue = this.player?.timer || 0;
    const progressPercentage = this.calculateProgress(timerValue);
    this.progress = progressPercentage.toString();

    const maxColor = 180;
    const minColor = 0;

    const color = maxColor - (progressPercentage / 100 * (maxColor - minColor));

    this.strokeColor = `hsl(${color}, 100%, 50%)`;
  }

  private calculateProgress(timerValue: number): number {
    return (timerValue / 120) * 100;
  }
}
