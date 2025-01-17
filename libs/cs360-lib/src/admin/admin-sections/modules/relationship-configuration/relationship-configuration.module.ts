import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerModule } from '@gs/gdk/spinner';
import { FilterItemsPipe, RelationshipConfigurationComponent } from './relationship-configuration.component';
import { RelationshipReportsConfigurationComponent } from "./relationship-reports-configuration/relationship-reports-configuration.component";
import { FieldSelectorDropdownModule } from './../../../field-selector-dropdown/field-selector-dropdown.module';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzCollapseModule } from '@gs/ng-horizon/collapse';
import { NzDividerModule } from '@gs/ng-horizon/divider';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzTreeModule } from '@gs/ng-horizon/tree';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzI18nModule } from '@gs/ng-horizon/i18n';

@NgModule({
  declarations: [
    RelationshipConfigurationComponent,
    RelationshipReportsConfigurationComponent,
    FilterItemsPipe
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NzSelectModule,
    DragDropModule,
    SpinnerModule,
    NzInputModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzTypographyModule,
    NzIconModule,
    NzCollapseModule,
    NzTreeModule,
    NzSkeletonModule,
    NzCheckboxModule,
    NzDividerModule,
    FieldSelectorDropdownModule,
    NzI18nModule
  ],
  entryComponents: [RelationshipConfigurationComponent]
})
export class RelationshipConfigurationModule { }
