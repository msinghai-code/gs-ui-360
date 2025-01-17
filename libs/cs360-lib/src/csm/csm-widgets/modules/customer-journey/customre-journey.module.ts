import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterModule } from 'angular-gridster2';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const nzModules = [
  NzModalModule,
  NzInputModule,
  NzStepsModule,
  NzTypographyModule,
  NzFormModule,
  NzIconModule,
  NzCheckboxModule,
  NzButtonModule,
  NzDrawerModule,
  NzButtonModule, 
  NzInputModule,
  NzFormModule,
  NzEmptyModule,
  NzSkeletonModule
];

 

import { SpinnerModule } from "@gs/gdk/spinner";
import { CustomerJourneyCsmComponent } from './customer-journey-csm.component';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzStepsModule } from '@gs/ng-horizon/steps';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { LazyElementsModule } from '@angular-extensions/elements';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { FieldConfigurationModule } from '@gs/cs360-lib/src/common';
@NgModule({
  declarations: [CustomerJourneyCsmComponent],
  imports: [
    CommonModule,
    GridsterModule,
    DragDropModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    FieldConfigurationModule,
    // GSSpinnerModule,
    SpinnerModule,
    ...nzModules,
    LazyElementsModule
  ],
  entryComponents: [CustomerJourneyCsmComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CustomerJourneyModule { }
