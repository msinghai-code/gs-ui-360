import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTabsModule } from '@gs/ng-horizon/tabs';
import { CompanyHierarchyConfigurationComponent } from './company-hierarchy-configuration.component';
import { FieldSelectorComponent } from './field-selector/field-selector.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzTagModule } from '@gs/ng-horizon/tag';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FieldConfigurationModule } from '@gs/cs360-lib/src/common';
import { FieldTreeViewWrapperModule } from '@gs/cs360-lib/src/common';
import { DocumentEventModule } from '@gs/cs360-lib/src/common';
import { NzButtonModule } from '@gs/ng-horizon/button';
// import { FieldTreeModule } from "@gs/gdk/field-tree";
import { NzI18nModule } from '@gs/ng-horizon/i18n';

@NgModule({
  declarations: [CompanyHierarchyConfigurationComponent, FieldSelectorComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NzTabsModule,
    NzTagModule,
    NzEmptyModule,
    NzTypographyModule,
    NzIconModule,
    DragDropModule,
    NzButtonModule,
    NzDrawerModule,
    FieldConfigurationModule,
    FieldTreeViewWrapperModule,
    NzToolTipModule,
    NzInputModule,
    DocumentEventModule,
    FormsModule,
    // FieldTreeModule,
      // FieldTreeViewModule,
    NzI18nModule
  ],
  entryComponents: [CompanyHierarchyConfigurationComponent]
})
export class CompanyHierarchyConfigurationModule { }
