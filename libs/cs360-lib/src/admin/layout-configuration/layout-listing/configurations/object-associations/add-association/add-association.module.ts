import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { AddAssociationComponent } from "./add-association.component";
import { CommonModule } from '@angular/common';
import { NzButtonModule } from "@gs/ng-horizon/button";
import { NzDrawerModule } from "@gs/ng-horizon/drawer";
import { NzTypographyModule } from "@gs/ng-horizon/typography";
import { AddAssociationContentModule } from "@gs/cs360-lib/src/common";
import { MultipleAssociationsAdditionComponent } from "./multiple-associations-addition/multiple-associations-addition.component";
import { NzI18nModule } from "@gs/ng-horizon/i18n";
import {FlexLayoutModule} from "@angular/flex-layout";

@NgModule({
  declarations: [
    AddAssociationComponent,
    MultipleAssociationsAdditionComponent
  ],
    imports: [
        CommonModule,
        NzButtonModule,
        NzTypographyModule,
        NzDrawerModule,
        AddAssociationContentModule,
        NzI18nModule,
        FlexLayoutModule
    ],
  exports: [AddAssociationComponent, MultipleAssociationsAdditionComponent],
  entryComponents: [AddAssociationComponent, MultipleAssociationsAdditionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AddAssociationModule { }
