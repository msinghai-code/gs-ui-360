import { NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import { PortfolioWidgetGridComponent } from "./portfolio-widget-grid.component";
import { SpinnerModule } from '@gs/gdk/spinner';
import { PortfolioCellEditorComponent } from './portfolio-cell-editor/portfolio-cell-editor.component';
import { FieldEditorModule } from '../field-editor/field-editor.module';
import { PortfolioCellRendererComponent } from './portfolio-cell-renderer/portfolio-cell-renderer.component';
import {AngularResizedEventModule} from "angular-resize-event";
import { HealthScoreRendererModule } from "./health-score-renderer/health-score-renderer.module";
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzI18nModule } from "@gs/ng-horizon/i18n";
import {GridVisualizerModule} from "./grid-visualizer/grid-visualizer.module";
import {CustomTooltip} from "./customtooltip";
import {FlexLayoutModule} from "@angular/flex-layout";
import {Gs360AppLinkModule} from "@gs/gdk/directives";
import {NameRendererComponent} from "./name-rendering-component";

@NgModule({
  imports: [
    CommonModule,
    GridVisualizerModule,
    FieldEditorModule,
    HealthScoreRendererModule,
    SpinnerModule,
    AngularResizedEventModule,
    NzIconModule,
    NzI18nModule,
    FlexLayoutModule,
    Gs360AppLinkModule
  ],
  declarations: [
    PortfolioWidgetGridComponent, 
    PortfolioCellEditorComponent, 
    PortfolioCellRendererComponent,
    CustomTooltip,
    NameRendererComponent],
  exports: [PortfolioWidgetGridComponent, NameRendererComponent],
  providers : [],
  entryComponents: [PortfolioCellEditorComponent, PortfolioCellRendererComponent, CustomTooltip, NameRendererComponent]
})
export class PortfolioWidgetGridModule { }
