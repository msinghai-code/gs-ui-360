import { NgModule } from '@angular/core';
import {ErrorReaderModule, TokenFieldModule, UtilityPipesModule
} from '@gs/cs360-lib/src/core-references';
import {FilterQueryService} from "@gs/gdk/filter/builder";
import { SpinnerModule } from '@gs/gdk/spinner';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FieldEditorComponent } from './field-editor.component';
import { CustomFormsModule } from 'ng2-validation';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
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
// import { QuillModule } from 'ngx-quill';
import { DocumentEventModule } from '@gs/cs360-lib/src/common';
import { NzPopoverModule } from '@gs/ng-horizon/popover';

@NgModule({
  declarations: [FieldEditorComponent, 
    SelectComponent,
    PicklistHighlightDirective],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SidebarModule,
    CustomFormsModule,
    ErrorReaderModule,
    // FormattersModule,
    TokenFieldModule,
    SpinnerModule,
    NzFormModule,
    NzInputModule,
    // QuillModule.forRoot(),
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
    NzI18nModule,
    NzPopoverModule
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
