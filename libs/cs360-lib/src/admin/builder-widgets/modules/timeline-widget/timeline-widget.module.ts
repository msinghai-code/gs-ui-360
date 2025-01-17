import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineWidgetComponent } from './timeline-widget.component';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';

@NgModule({
  declarations: [TimelineWidgetComponent],
  imports: [
    CommonModule,
    NzSkeletonModule
  ],
  entryComponents:[TimelineWidgetComponent]
})
export class TimelineWidgetModule { }
