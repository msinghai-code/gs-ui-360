import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'primeng/sidebar';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ng2-validation';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzDatePickerModule} from "@gs/ng-horizon/date-picker";
import { NzCheckboxModule} from "@gs/ng-horizon/checkbox";
import { NzGridModule} from "@gs/ng-horizon/grid";
import { NzSelectModule} from "@gs/ng-horizon/select";
import { NzFormModule} from "@gs/ng-horizon/form";
import { NzTypographyModule} from "@gs/ng-horizon/typography";
import { NzToolTipModule} from "@gs/ng-horizon/tooltip";
import { NzTimePickerModule } from '@gs/ng-horizon/time-picker';
import {RelationshipFieldEditorComponent} from "./relationship-field-editor.component";
import { ErrorReaderModule, TokenFieldModule } from '@gs/cs360-lib/src/core-references';

import { FilterQueryService } from "@gs/gdk/filter/builder";
import { SpinnerModule } from '@gs/gdk/spinner';
import { FieldEditorModule } from '@gs/cs360-lib/src/portfolio-copy';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { GsRteModule } from '@gs/gdk/rte';
import {RelationshipRichTextEditor} from './relationship-richt-text-editor/relationship-rich-text-editor.component';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { LookupSearchModule } from '@gs/gdk/lookup-search';

@NgModule({
  declarations: [RelationshipFieldEditorComponent,RelationshipRichTextEditor],
  imports: [
    CommonModule,
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
    NzIconModule,
    NzDatePickerModule,
    NzTimePickerModule,
    FieldEditorModule,
    NzI18nModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    GsRteModule,
    NzI18nModule,
    LookupSearchModule
  ],
  providers: [FilterQueryService],
  exports: [RelationshipFieldEditorComponent, RelationshipRichTextEditor]
})
export class RelationshipFieldEditorModule { }
