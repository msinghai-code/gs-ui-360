import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { AttributeFieldEditorWrapperComponent, FormatDataPipe } from "./attribute-field-editor-wrapper.component";
// import { FieldEditorModule } from '@gs/portfolio-lib/src/field-editor/field-editor.module';
import { FieldEditorModule } from '@gs/cs360-lib/src/portfolio-copy'
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzButtonModule } from "@gs/ng-horizon/button";
import { NzOverlayModule } from "@gs/ng-horizon/core";
import { CustomFormsModule } from 'ng2-validation';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzIconModule } from "@gs/ng-horizon/icon";
import { NzPopoverModule } from "@gs/ng-horizon/popover";
import { NzSkeletonModule } from "@gs/ng-horizon/skeleton";
import { NzToolTipModule } from "@gs/ng-horizon/tooltip";
import { AttributeFieldEditorComponent, BlurForwarder } from "./attribute-field-editor/attribute-field-editor.component";
import { TokenFieldModule, UtilityPipesModule } from '@gs/cs360-lib/src/core-references';
import { SpinnerModule } from '@gs/gdk/spinner';
import { NzFormModule } from "@gs/ng-horizon/form";
import { NzInputModule } from "@gs/ng-horizon/input";
import { NzSelectModule } from "@gs/ng-horizon/select";
import { NzGridModule } from "@gs/ng-horizon/grid";
import { NzCheckboxModule } from "@gs/ng-horizon/checkbox";
import { NzTypographyModule } from "@gs/ng-horizon/typography";
import { NzDatePickerModule } from "@gs/ng-horizon/date-picker";
import { NzTimePickerModule } from "@gs/ng-horizon/time-picker";
import { DocumentEventModule } from '@gs/cs360-lib/src/common';
import { ErrorReaderModule } from '@gs/cs360-lib/src/common';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { GsRteModule } from '@gs/gdk/rte';
import { ShowIfEllipsisModule } from "@gs/cs360-lib/src/common";
import { ExternalLinkModule } from "@gs/cs360-lib/src/common";
import { NzI18nModule } from "@gs/ng-horizon/i18n";
import { DecodeDataPipe } from "./attribute-field-editor/attribute-field-editor.component";
import { LookupSearchModule } from "@gs/gdk/lookup-search";

@NgModule({
    imports: [
        CommonModule,
        FieldEditorModule,
        FormsModule,
        ReactiveFormsModule,
        NzToolTipModule,
        NzIconModule,
        NzOverlayModule,
        NzPopoverModule,
        NzSkeletonModule,
        FlexLayoutModule,
        NzButtonModule,
        NzI18nModule,
        // SidebarModule,
        CustomFormsModule,
        ErrorReaderModule,
        // FormattersModule,
        TokenFieldModule,
        // DateInputsModule,
        SpinnerModule,
        NzFormModule,
        NzInputModule,
        NzSelectModule,
        NzGridModule,
        NzCheckboxModule,
        NzTypographyModule,
        NzToolTipModule,
        NzIconModule,
        NzDatePickerModule,
        NzTimePickerModule,
        NzButtonModule,
        DocumentEventModule,
        UtilityPipesModule,
        ShowIfEllipsisModule,
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),
        GsRteModule,
        ExternalLinkModule,
        LookupSearchModule
    ],
    declarations: [ BlurForwarder, AttributeFieldEditorWrapperComponent, AttributeFieldEditorComponent, FormatDataPipe, DecodeDataPipe ],
    entryComponents: [ AttributeFieldEditorWrapperComponent, AttributeFieldEditorComponent ],
    exports: [ AttributeFieldEditorWrapperComponent, AttributeFieldEditorComponent ]
})
export class AttributeFieldEditorWrapperModule {

}
