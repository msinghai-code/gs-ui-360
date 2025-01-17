import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthScoreRendererComponent } from './health-score-renderer.component';
import { HealthScoreModule } from '@gs/scorecard/health-score';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';

@NgModule({
  declarations: [HealthScoreRendererComponent],
  imports: [
    CommonModule,
    HealthScoreModule,
    NzToolTipModule
  ],
  exports: [HealthScoreRendererComponent],
  entryComponents: [HealthScoreRendererComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HealthScoreRendererModule { }
