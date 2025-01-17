import { NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import { PortfolioWidgetGridComponent } from "./portfolio-widget-grid.component";
// import { ReportViewerModule } from "@gs/core";
import {ReportViewerModule} from "@gs/report/report-viewer";
import { SpinnerModule } from '@gs/gdk/spinner';
import { PortfolioCellEditorComponent } from './portfolio-cell-editor/portfolio-cell-editor.component';
import { FieldEditorModule } from '../field-editor/field-editor.module';
import { PortfolioCellRendererComponent } from './portfolio-cell-renderer/portfolio-cell-renderer.component';
import {AngularResizedEventModule} from "angular-resize-event";
import { HealthScoreRendererModule } from "./health-score-renderer/health-score-renderer.module";
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzI18nModule } from "@gs/ng-horizon/i18n";

@NgModule({
  imports: [
    CommonModule,
    ReportViewerModule,
    FieldEditorModule,
    HealthScoreRendererModule,
    SpinnerModule,
    AngularResizedEventModule,
    NzIconModule,
    NzI18nModule,
  ],
  declarations: [
    PortfolioWidgetGridComponent, 
    PortfolioCellEditorComponent, 
    PortfolioCellRendererComponent],
  exports: [PortfolioWidgetGridComponent],
  providers : [],
  entryComponents: [PortfolioCellEditorComponent, PortfolioCellRendererComponent]
})
export class PortfolioWidgetGridModule { }
