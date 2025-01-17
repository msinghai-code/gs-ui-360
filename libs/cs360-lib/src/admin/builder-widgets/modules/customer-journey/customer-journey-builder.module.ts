import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterModule } from 'angular-gridster2';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldConfigurationModule } from '@gs/cs360-lib/src/common';
import { DocumentEventModule } from '@gs/cs360-lib/src/common';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { CustomerJourneySettingsComponent } from './customer-journey-builder-settings/customer-journey-builder-settings.component';
import { CustomerJourneyBuilderComponent } from './customerJourney-widget-builder/customer-journey-builder.component';
import { LazyElementsModule } from '@angular-extensions/elements';
import { NzNotificationModule } from '@gs/ng-horizon/notification';


const nzModules = [
  NzModalModule,
  NzButtonModule,
  NzIconModule,
  NzEmptyModule,
  NzNotificationModule
];

@NgModule({
  declarations: [CustomerJourneySettingsComponent,CustomerJourneyBuilderComponent],
  imports: [
    CommonModule,
    GridsterModule,
    CommonModule,
    DragDropModule,
    FlexLayoutModule,
    LazyElementsModule,
    FormsModule,
    ReactiveFormsModule,
    FieldConfigurationModule,
    ...nzModules,
    DocumentEventModule
  ],
  entryComponents: [CustomerJourneySettingsComponent,CustomerJourneyBuilderComponent],
  exports: [CustomerJourneySettingsComponent,CustomerJourneyBuilderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})


export class CustomerJourneyWidgetModule { }

