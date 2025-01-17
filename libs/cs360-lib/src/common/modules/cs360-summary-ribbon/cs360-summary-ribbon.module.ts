import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { Cs360SummaryRibbonComponent } from "./cs360-summary-ribbon.component";
import { SummaryAttributeModule } from "./summary-attribute/summary-attribute.module";

@NgModule({
  declarations: [Cs360SummaryRibbonComponent],
  imports: [
    CommonModule,
    NzTypographyModule,
    SummaryAttributeModule
  ],
  exports: [Cs360SummaryRibbonComponent]
})
export class Cs360SummaryRibbonModule { }
