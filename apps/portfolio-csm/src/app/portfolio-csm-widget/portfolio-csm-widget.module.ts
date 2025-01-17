import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import {
  ColumnPickerModule,
  PortfolioWidgetGridModule
  } from '@gs/portfolio-lib';
import { CommonModule } from '@angular/common';
import { GlobalFilterStripModule } from "@gs/gdk/filter/global";
import { GsPipesModule } from "@gs/gdk/pipes";
import { SpinnerModule } from '@gs/gdk/spinner';
import { DescribeService } from "@gs/gdk/services/describe";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule } from '@angular/common/http';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzGridModule } from '@gs/ng-horizon/grid';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzPopoverModule } from '@gs/ng-horizon/popover';
import { NzTabsModule } from '@gs/ng-horizon/tabs';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { PORTFOLIO_CSM_WIDGET_FEATURE_KEY, portfolioCsmWidgetReducer } from './state/portfolio-csm-widget.reducer';
import { PortfolioBulkEditComponent } from './portfolio-bulk-edit/portfolio-bulk-edit.component';
import { PortfolioBulkEditModalComponent } from './portfolio-bulk-edit/portfolio-bulk-edit-modal/portfolio-bulk-edit-modal.component';
import { PortfolioColumnChooserComponent } from './portfolio-column-chooser/portfolio-column-chooser.component';
import { PortfolioCsmWidgetComponent } from './portfolio-csm-widget.component';
import { PortfolioCsmWidgetEffects } from './state/portfolio-csm-widget.effects';
import { PortfolioCsmWidgetFacade } from './state/portfolio-csm-widget.facade';
import { PortfolioInlineEditComponent } from './portfolio-inline-edit/portfolio-inline-edit.component';
import { StoreModule } from '@ngrx/store';
import {AngularResizedEventModule} from "angular-resize-event";
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import {ColumnChooserModule} from "@gs/gdk/column-chooser";
import {
  PortfolioBulkEditModalModule
} from "./portfolio-bulk-edit/portfolio-bulk-edit-modal/portfolio-bulk-edit-modal.module";

@NgModule({
  declarations: [
    PortfolioCsmWidgetComponent,
    PortfolioInlineEditComponent,
    PortfolioBulkEditComponent,
    PortfolioColumnChooserComponent
  ],
  imports: [
    PortfolioWidgetGridModule,
    GlobalFilterStripModule,
    BrowserModule,
    SpinnerModule,
    CommonModule,
    GsPipesModule,
    HttpClientModule,
    NzPopoverModule,
    AngularResizedEventModule,
    NzButtonModule,
    ColumnPickerModule,
    NzIconModule,
    BrowserAnimationsModule,
    NzTypographyModule,
    NzDrawerModule,
    NzGridModule,
    NzModalModule,
    NzTabsModule,
    StoreModule.forFeature(PORTFOLIO_CSM_WIDGET_FEATURE_KEY, portfolioCsmWidgetReducer),
    EffectsModule.forFeature([PortfolioCsmWidgetEffects]),
    EffectsModule.forRoot([]),
    NzI18nModule,
    PortfolioBulkEditModalModule,
    ColumnChooserModule
  ],
  entryComponents: [PortfolioBulkEditComponent, PortfolioBulkEditModalComponent],
  exports: [PortfolioCsmWidgetComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    DescribeService,
    PortfolioCsmWidgetFacade,
  ]
})
export class PortfolioCsmWidgetModule {

  constructor() {
  }
}
