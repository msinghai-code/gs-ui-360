import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import {NzIconModule} from "@gs/ng-horizon/icon";
import { SummaryAttributeComponent } from "./summary-attribute.component";
import { AttributeFinalValue, NumberViewComponent } from "./summary-views/number-view/number-view.component";
import { VisualizationViewComponent } from "./summary-views/visualization-view/visualization-view.component";
import { ScoreViewModule } from "./summary-views/scoring-view/score-view.module";
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { ChartVisualizerModule } from '@gs/gdk/visualizer/chart-visualizer';
import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
    declarations: [
        SummaryAttributeComponent,
        NumberViewComponent,
        VisualizationViewComponent,
        AttributeFinalValue
    ],
    imports: [
        CommonModule,
        NzTypographyModule,
        NzToolTipModule,
        NzIconModule,
        ScoreViewModule,
        NzI18nModule,
        ChartVisualizerModule,
        HighchartsChartModule
    ],
    exports: [SummaryAttributeComponent]
})
export class SummaryAttributeModule { }
