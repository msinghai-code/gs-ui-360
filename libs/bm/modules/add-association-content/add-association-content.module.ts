import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { AddAssociationContentComponent, DisableResetDefinitionPipe, FilterObjectsForMultipleAssocPipe, FilterObjectsPipe } from "./add-association-content.component";
import { CommonModule } from '@angular/common';
import { FieldTreeModule } from "@gs/gdk/field-tree";
import { SpinnerModule } from '@gs/gdk/spinner';
import { NzAlertModule } from '@gs/ng-horizon/alert';
import { NzButtonModule } from "@gs/ng-horizon/button";
import { NzPopoverModule } from "@gs/ng-horizon/popover";
import { NzDropDownModule } from "@gs/ng-horizon/dropdown";
import { NzDrawerModule } from "@gs/ng-horizon/drawer";
import { FormsModule } from '@angular/forms';
import { NzTypographyModule } from "@gs/ng-horizon/typography";
import { FlexModule } from "@angular/flex-layout";
import { NzSelectModule } from "@gs/ng-horizon/select";
import { NzSwitchModule } from "@gs/ng-horizon/switch";
import { NzInputModule } from "@gs/ng-horizon/input";
import { NzIconModule } from "@gs/ng-horizon/icon";
import { NzToolTipModule } from "@gs/ng-horizon/tooltip";
import { MultipleAssociationsAdditionContentComponent } from './multiple-associations-addition-content/multiple-associations-addition-content.component';
import { NzCollapseModule } from "@gs/ng-horizon/collapse";
import { GsFocusRemoverModule } from "@gs/bm/shared";
import { NzNotificationModule } from '@gs/ng-horizon/notification';
import { DescribeModule } from "@gs/gdk/services/describe";
import { NzI18nModule } from "@gs/ng-horizon/i18n";
import { NzSpinModule } from '@gs/ng-horizon/spin';


@NgModule({
  declarations: [
    AddAssociationContentComponent,
    DisableResetDefinitionPipe,
    FilterObjectsPipe,
    FilterObjectsForMultipleAssocPipe,
    MultipleAssociationsAdditionContentComponent
  ],
  imports: [
    CommonModule,
    SpinnerModule,
    NzButtonModule,
    NzPopoverModule,
    FormsModule,
    NzTypographyModule,
    FlexModule,
    NzInputModule,
    NzIconModule,
    NzSelectModule,
    NzSwitchModule,
    FieldTreeModule,
    NzDropDownModule,
    NzDrawerModule,
    NzToolTipModule,
    NzCollapseModule,
    GsFocusRemoverModule,
    NzAlertModule,
    NzNotificationModule,
    DescribeModule,
    NzI18nModule,
    NzSpinModule
  ],
  exports: [AddAssociationContentComponent, 
    MultipleAssociationsAdditionContentComponent, 
    DisableResetDefinitionPipe,
    FilterObjectsPipe,
    FilterObjectsForMultipleAssocPipe],
  entryComponents: [AddAssociationContentComponent, MultipleAssociationsAdditionContentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AddAssociationContentModule { }
