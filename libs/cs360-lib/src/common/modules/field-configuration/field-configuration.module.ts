import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldConfigurationComponent } from './field-configuration.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzInputNumberModule } from '@gs/ng-horizon/input-number';
import { DocumentEventModule } from '../../directives/document-event.module';
import { NzSwitchModule } from '@gs/ng-horizon/switch';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzRadioModule } from '@gs/ng-horizon/radio';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzInputTagModule } from '@gs/ng-horizon/input-tag';
import { NzDropDownModule } from '@gs/ng-horizon/dropdown';
import { FieldTreeViewWrapperModule } from '../field-tree-view-wrapper/field-tree-view-wrapper.module';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { FieldTreeModule } from "@gs/gdk/field-tree";
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import {FieldChooserModule} from "@gs/gdk/field-chooser";
import { SummaryConfigurationService } from '../../services/summary-configuration.service';
@NgModule({
  declarations: [FieldConfigurationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzTypographyModule,
    NzCheckboxModule,
    NzInputNumberModule,
    NzInputModule,
    NzIconModule,
    NzRadioModule,
    FieldTreeViewWrapperModule,
    NzToolTipModule,
    NzInputTagModule,
    FlexLayoutModule,
    NzDropDownModule,
    NzFormModule,
    NzButtonModule,
    DocumentEventModule,
    NzSwitchModule,
    FieldTreeModule,
    NzI18nModule,
      FieldChooserModule,
  ],
  providers: [SummaryConfigurationService],
  entryComponents: [FieldConfigurationComponent],
  exports: [FieldConfigurationComponent]
})
export class FieldConfigurationModule { }
