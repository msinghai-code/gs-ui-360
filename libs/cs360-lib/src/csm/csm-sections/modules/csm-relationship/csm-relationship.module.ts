import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsmRelationshipComponent } from './csm-relationship.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzTypographyModule } from "@gs/ng-horizon/typography";
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzListModule } from '@gs/ng-horizon/list';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzSwitchModule } from '@gs/ng-horizon/switch';
import { NzRadioModule } from '@gs/ng-horizon/radio';
import { RelationshipCardComponent } from './relationship-card/relationship-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from '@gs/ng-horizon/card';
// import { HealthScoreRendererModule } from "@gs/portfolio-lib/src/portfolio-widget-grid/health-score-renderer/health-score-renderer.module";
import { HealthScoreRendererModule } from "@gs/cs360-lib/src/portfolio-copy";
import { NzPopoverModule } from '@gs/ng-horizon/popover';
import { FilterQueryBuilderModule} from "@gs/gdk/filter/builder";
import { GridModule, GridCellRenderersModule} from "@gs/gdk/grid";
import { SpinnerModule } from '@gs/gdk/spinner';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzCollapseModule } from '@gs/ng-horizon/collapse';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzBadgeModule } from '@gs/ng-horizon/badge';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzDividerModule } from '@gs/ng-horizon/divider';
import { NzMessageModule } from '@gs/ng-horizon/message';
import { RelationshipFiltersComponent } from "./relationship-filters/relationship-filters.component";
import {
  RelationshipViewComponent,
  RelationshipViewHostDirective
} from "./relationship-view/relationship-view.component";
import { RelationshipTypeViewComponent } from "./relationship-view/relationship-type-view/relationship-type-view.component";
import { RelationshipFilterViewComponent } from "./relationship-view/relationship-filter-view/relationship-filter-view.component";
import { RelationshipFormModule } from './../../../relationship-form/relationship-form.module';
import { RelationshipListViewComponent } from "./relationship-view/relationship-list-view/relationship-list-view.component";
import { ReportWidgetCs360ElementLoader, ReportWidgetElementModule } from '@gs/cs360-lib/src/common';
import { GridColumnChooserModule } from '@gs/cs360-lib/src/common';
import { CardViewModule } from '@gs/cs360-lib/src/common';
import { RelationshipSummaryRibbonViewModule } from "./relationship-view/relationship-summary-ribbon-view/relationship-summary-ribbon-view.module";
import { NzDropDownModule } from '@gs/ng-horizon/dropdown';
import { NzPaginationModule } from "@gs/ng-horizon/pagination";
import { DescribeModule } from "@gs/gdk/services/describe";
import {NzI18nModule} from "@gs/ng-horizon/i18n";
import {NzDatePickerModule} from "@gs/ng-horizon/date-picker";
import { ReportViewerModule } from '@gs/report/report-viewer';
import { GsMappingRendererComponent } from './relationship-view/relationship-list-view/gs-mapping-renderer.component'
import { NzAlertModule } from '@gs/ng-horizon/alert';
import {RTCellRendererComponent} from "./relationship-view/rtecellrenderer/gs-rt-cell-renderer/gs-rt-cell-renderer.component";
import { Gs360AppLinkModule } from "@gs/gdk/directives";
import { NzBreadCrumbModule } from "@gs/ng-horizon/breadcrumb";
import { ChartVisualizerModule } from '@gs/gdk/visualizer/chart-visualizer';
import { ActionColumnRenderer } from './relationship-view/relationship-list-view/processors/gs-column-action-renderered.component';


@NgModule({
  declarations: [
    CsmRelationshipComponent,
    RelationshipCardComponent,
    RelationshipFiltersComponent,
    RelationshipViewHostDirective,
    RelationshipViewComponent,
    RelationshipTypeViewComponent,
    RelationshipFilterViewComponent,
    RelationshipListViewComponent,
    GsMappingRendererComponent,
    ActionColumnRenderer,
    RTCellRendererComponent],
  imports: [
    Gs360AppLinkModule,
    CommonModule,
    FlexLayoutModule,
    NzTypographyModule,
    NzInputModule,
    NzListModule,
    NzButtonModule,
    NzIconModule,
    NzSwitchModule,
    GridModule,
    GridCellRenderersModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    HealthScoreRendererModule,
    FilterQueryBuilderModule,
    NzModalModule,
    NzCollapseModule,
    NzRadioModule,
    NzDrawerModule,
    NzSkeletonModule,
    NzEmptyModule,
    NzToolTipModule,
    RelationshipFormModule,
    // MatListModule,
    NzPopoverModule,
    GridColumnChooserModule,
    CardViewModule,
    SpinnerModule,
    NzBadgeModule,
    NzDividerModule,
    NzMessageModule,
    NzDropDownModule,
    RelationshipSummaryRibbonViewModule,
    NzPaginationModule,
    NzAlertModule,
    DescribeModule,
    NzI18nModule,
    NzDatePickerModule,
    ReportViewerModule,
    // MatSelectModule,
    NzAlertModule,
    NzI18nModule,
    ReportWidgetElementModule,
    ChartVisualizerModule,
    NzBreadCrumbModule],
  entryComponents: [
    CsmRelationshipComponent,
    ReportWidgetCs360ElementLoader,
    RelationshipTypeViewComponent,
    RelationshipFilterViewComponent,
    RelationshipListViewComponent,
    GsMappingRendererComponent,
    ActionColumnRenderer,
    RTCellRendererComponent
  ],
  exports: [CsmRelationshipComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmRelationshipModule {
  static entry = CsmRelationshipComponent;
}
