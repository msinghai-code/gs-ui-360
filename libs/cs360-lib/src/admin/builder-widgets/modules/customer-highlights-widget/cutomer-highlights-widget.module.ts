import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { CustomerHighlightsWidgetComponent } from './customer-highlights-widget.component';

@NgModule({
  declarations: [CustomerHighlightsWidgetComponent],
  imports: [
    CommonModule,
    NzSkeletonModule
  ],
  entryComponents:[CustomerHighlightsWidgetComponent]
})
export class CustomerHighlightsWidgetModule { }
