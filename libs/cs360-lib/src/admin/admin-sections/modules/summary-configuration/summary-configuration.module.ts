import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterModule } from 'angular-gridster2';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SummaryConfigurationComponent } from './summary-configuration.component';
import { SectionListingModule } from '../shared/section-listing/section-listing.module';
import { SummaryConfigurationService } from '@gs/cs360-lib/src/common';
import { EnvironmentModule } from "@gs/gdk/services/environment";
import { SpinnerModule } from '@gs/gdk/spinner';
import { FieldTreeViewWrapperModule } from '@gs/cs360-lib/src/common';
import { GenericHostDirectiveModule } from '@gs/cs360-lib/src/common';
import { BuilderWidgetModule } from './../../../builder-widgets/builder-widgets.module';
import { DocumentEventModule } from '@gs/cs360-lib/src/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportWidgetElementModule } from '@gs/cs360-lib/src/common';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzSwitchModule } from '@gs/ng-horizon/switch';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { WidgetSourceLabelPipe } from './widget-source-label.pipe';

@NgModule({
  declarations: [SummaryConfigurationComponent, WidgetSourceLabelPipe],
  entryComponents: [SummaryConfigurationComponent],
  imports: [
    CommonModule,
    GridsterModule,
    DragDropModule,
    FlexLayoutModule,
    NzSwitchModule,
    SectionListingModule,
    BuilderWidgetModule,
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    NzDrawerModule,
    SpinnerModule,
    FieldTreeViewWrapperModule,
    NzInputModule,
    NzEmptyModule,
    GenericHostDirectiveModule,
    ReportWidgetElementModule,
    DocumentEventModule,
    FormsModule,
    NzModalModule,
    ReactiveFormsModule,
    NzTypographyModule,
    NzToolTipModule,
    EnvironmentModule,
    NzI18nModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [SummaryConfigurationService]
})
export class SummaryConfigurationModule { }
