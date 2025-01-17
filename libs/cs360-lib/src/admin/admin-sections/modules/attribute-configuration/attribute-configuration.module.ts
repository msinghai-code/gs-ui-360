import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreFieldsPresentInGroup, AttributeConfigurationComponent, isFieldEditDisabledPipe } from './attribute-configuration.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GridsterModule } from 'angular-gridster2';
import { SpinnerModule } from '@gs/gdk/spinner';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { SectionListingModule } from '../shared/section-listing/section-listing.module';
import { FieldConfigurationModule } from '@gs/cs360-lib/src/common';
import { FieldTreeViewWrapperModule } from '@gs/cs360-lib/src/common';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzCollapseModule } from '@gs/ng-horizon/collapse';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzStepsModule } from '@gs/ng-horizon/steps';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { DocumentEventModule } from '@gs/cs360-lib/src/common';
import { ListItemSortModule } from '@gs/cs360-lib/src/common';
import {GsPipesModule} from "@gs/gdk/pipes";
import { EnvironmentModule } from "@gs/gdk/services/environment";
import { NzI18nModule } from '@gs/ng-horizon/i18n';

const nzModules = [
  NzModalModule,
  NzInputModule,
  NzStepsModule,
  NzTypographyModule,
  NzFormModule,
  NzIconModule,
  NzCheckboxModule,
  NzButtonModule,
  NzCollapseModule,
  NzDrawerModule];

@NgModule({
  declarations: [AttributeConfigurationComponent, AreFieldsPresentInGroup, isFieldEditDisabledPipe],
  entryComponents: [AttributeConfigurationComponent],
  imports: [
    CommonModule,
    ...nzModules,
    GsPipesModule,
    FieldTreeViewWrapperModule,
    SpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    SectionListingModule,
    FieldConfigurationModule,
    GridsterModule,
    DragDropModule,
    DocumentEventModule,
    NzEmptyModule,
    NzToolTipModule,
    ListItemSortModule,
    EnvironmentModule,
    NzI18nModule
  ]
})
export class AttributeConfigurationModule { }
