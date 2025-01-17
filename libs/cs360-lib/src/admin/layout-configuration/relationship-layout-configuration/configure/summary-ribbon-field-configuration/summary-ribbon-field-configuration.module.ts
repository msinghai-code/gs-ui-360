import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzInputNumberModule } from '@gs/ng-horizon/input-number';
import { DocumentEventModule, FieldTreeViewWrapperModule } from '@gs/cs360-lib/src/common';
import { NzSwitchModule } from '@gs/ng-horizon/switch';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzRadioModule } from '@gs/ng-horizon/radio';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzDropDownModule } from '@gs/ng-horizon/dropdown';
import {SummaryRibbonFieldConfigurationComponent} from "./summary-ribbon-field-configuration.component";
import {NzI18nModule} from "@gs/ng-horizon/i18n";
import { NzInputTagModule } from '@gs/ng-horizon/input-tag';

@NgModule({
  declarations: [SummaryRibbonFieldConfigurationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzCheckboxModule,
    NzInputNumberModule,
    NzInputModule,
    NzInputTagModule,
    NzIconModule,
    NzRadioModule,
    FieldTreeViewWrapperModule,
    NzToolTipModule,
    FlexLayoutModule,
    NzDropDownModule,
    NzFormModule,
    NzButtonModule,
    DocumentEventModule,
    NzSwitchModule,
    NzI18nModule
  ],
  entryComponents: [SummaryRibbonFieldConfigurationComponent],
  exports: [SummaryRibbonFieldConfigurationComponent]
})
export class SummaryRibbonFieldConfigurationModule { }
