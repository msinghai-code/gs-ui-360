import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from '@gs/ng-horizon/select';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { RelationshipFormComponent } from "./relationship-form.component";
import { LookupSearchModule } from '@gs/gdk/lookup-search';
import { NzAlertModule } from '@gs/ng-horizon/alert';
//TODO: TO BE MOVED TO CORE
import { EnvironmentModule } from "@gs/gdk/services/environment";
import { RelationshipFieldEditorModule } from "./relationship-field-editor/relationship-field-editor.module";
import {NzI18nModule} from "@gs/ng-horizon/i18n";
@NgModule({
  declarations: [
    RelationshipFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NzSelectModule,
    NzSkeletonModule,
    NzButtonModule,
    NzEmptyModule,
    RelationshipFieldEditorModule,
    EnvironmentModule,
    NzI18nModule,
    LookupSearchModule,
    NzAlertModule
  ],
  entryComponents: [
    RelationshipFormComponent
  ],
  exports: [
    RelationshipFormComponent
  ]
})
export class RelationshipFormModule { }
