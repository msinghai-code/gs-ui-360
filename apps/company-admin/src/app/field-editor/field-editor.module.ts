import { NgModule } from '@angular/core';
import {
  TokenFieldModule,
  ErrorReaderModule
} from '@gs/core';
import {FilterQueryService} from "@gs/gdk/filter/builder";
import { SpinnerModule } from '@gs/gdk/spinner';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatStepperModule, MatButtonModule, MatInputModule, MatAutocompleteModule, MatSelectModule, MatCheckboxModule, MatDatepickerModule, MatTooltipModule } from '@angular/material';
import { SidebarModule } from 'primeng/sidebar';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FieldEditorComponent, LabelWithSymbolPipe, SearchResultPipe } from '../field-editor/field-editor.component';
import { CustomFormsModule } from 'ng2-validation';
import { EditorModule } from 'primeng/editor';
import { QuillModule } from 'ngx-quill';
import { FieldEditorService } from './field-editor.service';
import { NzTimePickerModule } from '@gs/ng-horizon/time-picker';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { NzI18nService } from '@gs/ng-horizon/i18n';
@NgModule({
  declarations: [FieldEditorComponent, LabelWithSymbolPipe, SearchResultPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SidebarModule,
    MatIconModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatTooltipModule,
    CustomFormsModule,
    EditorModule,
    ErrorReaderModule,
    // FormattersModule,
    TokenFieldModule,
    SpinnerModule,
    MatStepperModule,
    NzTimePickerModule,
    NzI18nModule,
    QuillModule.forRoot()
  ],
  providers: [FilterQueryService, FieldEditorService],
  bootstrap: [FieldEditorComponent],
  exports: [FieldEditorComponent]
})
export class FieldEditorModule {}
