import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthScoreComponent } from "./health-score.component";
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { HealthScoreModule } from '@gs/scorecard/health-score';
@NgModule({
  declarations: [HealthScoreComponent],
  imports: [
    CommonModule,
    NzToolTipModule,
    HealthScoreModule
  ],
  exports: [HealthScoreComponent]
})
export class HealthScoreWrapModule { } 
