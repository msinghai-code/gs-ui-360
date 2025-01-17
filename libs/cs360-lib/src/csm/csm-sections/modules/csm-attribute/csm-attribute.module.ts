import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsmAttributeComponent } from './csm-attribute.component';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GridsterModule } from 'angular-gridster2';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzDividerModule } from '@gs/ng-horizon/divider';
import { CSMAttributeService } from './csm-attribute.service';
// import { FieldEditorModule} from '../../../../../portfolio-lib';
import { FieldEditorModule} from '@gs/cs360-lib/src/portfolio-copy';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { CsmAttributeGroupComponent } from './csm-attribute-group/csm-attribute-group.component';
import { NzPopoverModule } from '@gs/ng-horizon/popover';
import { AttributeFieldEditorWrapperModule } from '../../../attribute-field-editor-wrapper/attribute-field-editor-wrapper.module';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzOverlayModule } from '@gs/ng-horizon/core';
import { SpinnerModule } from '@gs/gdk/spinner';
import { EmptyModule } from '../empty/empty.module';
import { GsGridsterResponsiveColsModule } from '@gs/cs360-lib/src/common';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { ShowIfEllipsisModule } from "@gs/cs360-lib/src/common";
import {CsmAttributeGroupMiniComponent} from "./csm-attribute-group-mini/csm-attribute-group-mini.component";
@NgModule({
  declarations: [CsmAttributeComponent, CsmAttributeGroupComponent, CsmAttributeGroupMiniComponent],
  imports: [
    CommonModule,
    NzEmptyModule,
    GridsterModule,
    NzTypographyModule,
    NzDividerModule,
    EmptyModule,
    SpinnerModule,
    FieldEditorModule,
    NzIconModule,
    FlexLayoutModule,
    NzPopoverModule,
    NzButtonModule,
    NzOverlayModule,
    AttributeFieldEditorWrapperModule,
    GsGridsterResponsiveColsModule,
    NzToolTipModule,
    ShowIfEllipsisModule
  ],
  providers : [CSMAttributeService],
  entryComponents:[CsmAttributeComponent],
  exports: [CsmAttributeComponent, CsmAttributeGroupComponent, CsmAttributeGroupMiniComponent]
})
export class CsmAttributeModule {
  static entry = CsmAttributeComponent;
}
