import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { CsmCompanyHierarchyComponent } from './csm-company-hierarchy.component';
import { NzRadioModule } from '@gs/ng-horizon/radio';
import { GridModule } from "@gs/gdk/grid";
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { HealthScoreRendererModule } from "@gs/cs360-lib/src/portfolio-copy";
import { GlobalFilterStripModule } from '@gs/gdk/filter/global';
import { NzBadgeModule } from '@gs/ng-horizon/badge';
import { FilterQueryBuilderModule} from "@gs/gdk/filter/builder";
import { SpinnerModule } from '@gs/gdk/spinner';
import { CompanyHierarchyChartComponent } from './company-hierarchy-chart/company-hierarchy-chart.component';
import { MapModule } from './company-hierarchy-chart/map/map.module';
import { NzAlertModule } from '@gs/ng-horizon/alert';
import { ObjectFilterQueryModule } from '@gs/gdk/filter/builder';
import {NzI18nModule} from "@gs/ng-horizon/i18n";
import { NameRendererComponent } from './common.component';
import { Gs360AppLinkModule } from "@gs/gdk/directives";
import { ExternalLinkModule } from '@gs/cs360-lib/src/common';
import { CompanyHierarchyFilterViewComponent } from './company-hierarchy-filter-view/company-hierarchy-filter-view.component'
import { GridCellRenderersModule } from '@gs/gdk/grid';
import { NzTagModule } from '@gs/ng-horizon/tag'
import { AgGridModule } from "@ag-grid-community/angular";
@NgModule({
  declarations: [CsmCompanyHierarchyComponent, CompanyHierarchyChartComponent, NameRendererComponent, CompanyHierarchyFilterViewComponent],
  imports: [
    Gs360AppLinkModule.forRoot(),
    CommonModule,
      HealthScoreRendererModule,
    MapModule,
    NzEmptyModule,
    NzIconModule,
    NzButtonModule,
    NzRadioModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    NzInputModule,
    FormsModule,
    GridModule,
    NzBadgeModule,
    SpinnerModule,
    NzTypographyModule,
    NzDrawerModule,
    NzModalModule,
    FilterQueryBuilderModule,
    NzAlertModule,
    ObjectFilterQueryModule,
    NzI18nModule,
    GlobalFilterStripModule,
    ExternalLinkModule,
    AgGridModule.withComponents([
      NameRendererComponent
    ]),
      GridCellRenderersModule,
      NzTagModule
  ],
  providers: [],
  entryComponents:[CsmCompanyHierarchyComponent, CompanyHierarchyFilterViewComponent, NameRendererComponent],
  exports: [CsmCompanyHierarchyComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmCompanyHierarchyModule {
  static entry = CsmCompanyHierarchyComponent;
}
