import { NgModule } from '@angular/core';
import {UtilityPipesModule} from "../pipes/utility-pipes/utility-pipes.module";
import {ErrorReaderModule} from "../pipes/error-reader/error-reader.module";
import {FilterQueryService} from "@gs/gdk/filter/builder";
import { SpinnerModule } from '@gs/gdk/spinner';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FieldEditorComponent } from './field-editor.component';
import {NzI18nModule} from "@gs/ng-horizon/i18n";
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzDatePickerModule} from "@gs/ng-horizon/date-picker";
import { NzCheckboxModule} from "@gs/ng-horizon/checkbox";
import { NzGridModule} from "@gs/ng-horizon/grid";
import { NzSelectModule} from "@gs/ng-horizon/select";
import { NzFormModule} from "@gs/ng-horizon/form";
import { NzTypographyModule} from "@gs/ng-horizon/typography";
import { NzToolTipModule} from "@gs/ng-horizon/tooltip";
import { PicklistHighlightDirective } from './picklist-highlight.directive';
import { NzTimePickerModule } from '@gs/ng-horizon/time-picker';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { SelectComponent } from './select/select.component';
import { NzPopoverModule } from '@gs/ng-horizon/popover';
import { DocumentEventModule } from '../../../cs360-lib/src/common/directives/document-event.module';
import { LookupSearchModule } from '@gs/gdk/lookup-search';

@NgModule({
  declarations: [
    FieldEditorComponent,
    SelectComponent,
    PicklistHighlightDirective],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // SidebarModule,
    // CustomFormsModule,
    ErrorReaderModule,
    // FormattersModule,
    // DateInputsModule,
    SpinnerModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzGridModule,
    NzCheckboxModule,
    NzTypographyModule,
    NzToolTipModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzButtonModule,
    DocumentEventModule,
    UtilityPipesModule,
    ErrorReaderModule,
    NzI18nModule,
    NzPopoverModule,
    LookupSearchModule
  ],
  providers: [FilterQueryService],
  bootstrap: [FieldEditorComponent],
  exports: [
    FieldEditorComponent,
    SelectComponent,
    PicklistHighlightDirective
  ]
})
export class FieldEditorModule {}
