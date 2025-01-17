import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { GsPipesModule } from "@gs/gdk/pipes";
import { SpinnerModule } from '@gs/gdk/spinner';
import { FilterQueryBuilderModule} from "@gs/gdk/filter/builder";
import { DescribeService } from "@gs/gdk/services/describe";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule, MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule, MatListModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatButtonToggleModule,
  MatTooltipModule, MatNativeDateModule
} from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { PORTFOLIO_ADMIN_WIDGET_FEATURE_KEY, portfolioAdminWidgetReducer } from './state/portfolio-admin-widget.reducer';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { PortfolioAdminWidgetComponent as PortfolioAdminWidgetComponent } from './portfolio-admin-widget.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AddWidgetFieldComponent } from './portfolio-admin-widget-setting/add-widget-field/add-widget-field.component';
import { DataTypePipe, WidgetFieldComponent } from './portfolio-admin-widget-setting/widget-field/widget-field.component';
import { PortfolioAdminWidgetEffects } from './state/portfolio-admin-widget.effects';
import { PortfolioAdminWidgetFacade } from './state/portfolio-admin-widget.facade';
import {
  ColumnPickerModule,
  PortfolioWidgetGridModule
} from '@gs/portfolio-lib';
import { PortfolioAdminWidgetSettingComponent } from './portfolio-admin-widget-setting/portfolio-admin-widget-setting.component';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzTabsModule } from '@gs/ng-horizon/tabs';
import { PortfolioLiveAdminGridComponent } from './portfolio-live-admin-grid/portfolio-live-admin-grid.component';
import { PortfolioLightAdminGridComponent } from './portfolio-light-admin-grid/portfolio-light-admin-grid.component';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzInputModule } from '@gs/ng-horizon/input';
import {AngularResizedEventModule} from "angular-resize-event";
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzTagModule } from '@gs/ng-horizon/tag';
import { NzToolTipModule } from "@gs/ng-horizon/tooltip"

@NgModule({
  declarations: [
    PortfolioAdminWidgetSettingComponent, 
    PortfolioLiveAdminGridComponent,
    PortfolioLightAdminGridComponent,
    PortfolioAdminWidgetComponent,
    WidgetFieldComponent,
    DataTypePipe,
    AddWidgetFieldComponent
  ],
  imports: [
    ReactiveFormsModule,
    ColumnPickerModule,
    AngularResizedEventModule,
    PortfolioWidgetGridModule,
    BrowserModule,
    SpinnerModule,
    FormsModule,
    SidebarModule,
    CommonModule,
    NzDrawerModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    MatProgressSpinnerModule,
    MatButtonModule, MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    NzTabsModule,
    MatInputModule, MatListModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatTooltipModule,
    DragDropModule,
    StoreModule.forFeature(PORTFOLIO_ADMIN_WIDGET_FEATURE_KEY, portfolioAdminWidgetReducer),
    EffectsModule.forFeature([PortfolioAdminWidgetEffects]),
    FilterQueryBuilderModule,
    GsPipesModule,
    HttpClientModule,
    NzTypographyModule,
    NzTabsModule,
    EffectsModule.forRoot([]),
    BrowserAnimationsModule,
    NzCheckboxModule,
    NzTagModule,
    NzToolTipModule,
    NzI18nModule
  ],
  entryComponents: [
    PortfolioAdminWidgetSettingComponent,
    PortfolioLiveAdminGridComponent,
    PortfolioLightAdminGridComponent,
    PortfolioAdminWidgetComponent
  ],
  exports: [
    PortfolioAdminWidgetSettingComponent,
    PortfolioAdminWidgetComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DescribeService, PortfolioAdminWidgetFacade]
})
export class PortfolioAdminWidgetModule {
  static getPortfolioWidgetComponent() {
    return PortfolioAdminWidgetComponent;
  }
}
