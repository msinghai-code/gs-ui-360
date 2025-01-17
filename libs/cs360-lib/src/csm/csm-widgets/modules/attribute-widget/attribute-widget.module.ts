import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterModule } from 'angular-gridster2';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AttributeWidgetCsmComponent } from './attribute-widget-csm/attribute-widget-csm.component';

const nzModules = [
  NzTypographyModule,
  NzIconModule,
  NzIconModule,
  NzEmptyModule,
  NzSkeletonModule
];
import { CsmAttributeModule } from '../../../csm-sections/modules/csm-attribute/csm-attribute.module';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { FieldConfigurationModule } from '@gs/cs360-lib/src/common';
import {NzButtonModule} from "@gs/ng-horizon/button";

@NgModule({
  declarations: [AttributeWidgetCsmComponent],
    imports: [
        CommonModule,
        GridsterModule,
        DragDropModule,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,
        FieldConfigurationModule,
        CsmAttributeModule,
        ...nzModules,
        NzButtonModule
    ],
  entryComponents: [AttributeWidgetCsmComponent]
})
export class AttributeWidgetModule { }
