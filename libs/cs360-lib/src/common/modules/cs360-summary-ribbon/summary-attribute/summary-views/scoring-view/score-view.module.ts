import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NzSliderModule} from '@gs/ng-horizon/slider'
import {NumericComponent} from "./numeric/numeric.component";
import {GradeComponent} from "./grade/grade.component";
import {ColorComponent} from "./color/color.component";
import {ScoreViewComponent} from "./score-view.component";
import {NzToolTipModule} from "@gs/ng-horizon/tooltip";
import {NzI18nModule} from "@gs/ng-horizon/i18n";

@NgModule({
  declarations: [
    NumericComponent,
    GradeComponent,
    ColorComponent,
    ScoreViewComponent
  ],
    imports: [
        CommonModule,
        NzSliderModule,
        NzToolTipModule,
        NzI18nModule
    ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    NumericComponent,
    GradeComponent,
    ColorComponent,
    ScoreViewComponent
  ],
})
export class ScoreViewModule {}
