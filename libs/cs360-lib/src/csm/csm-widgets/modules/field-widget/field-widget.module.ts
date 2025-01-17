import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldWidgetComponent } from './field-widget.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzDividerModule } from '@gs/ng-horizon/divider';
import { AttributeFieldEditorWrapperModule } from '../../../attribute-field-editor-wrapper/attribute-field-editor-wrapper.module';
// import { FieldEditorModule } from '../../../../../../portfolio-lib';
import { FieldEditorModule } from '@gs/cs360-lib/src/portfolio-copy';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { ShowIfEllipsisModule } from "@gs/cs360-lib/src/common";
import { SpinnerModule } from '@gs/gdk/spinner';
import {NzCheckboxModule} from "@gs/ng-horizon/checkbox";
import {FormsModule} from "@angular/forms";
import { GsRteModule } from '@gs/gdk/rte';

@NgModule({
  declarations: [FieldWidgetComponent],
    imports: [
        CommonModule,
        NzTypographyModule,
        NzDividerModule,
        FieldEditorModule,
        NzIconModule,
        FlexLayoutModule,
        NzEmptyModule,
        NzSkeletonModule,
        NzToolTipModule,
        AttributeFieldEditorWrapperModule,
        ShowIfEllipsisModule,
        SpinnerModule,
        NzCheckboxModule,
        FormsModule,
        GsRteModule
    ],
  entryComponents: [FieldWidgetComponent]
})
export class FieldWidgetModule { }
