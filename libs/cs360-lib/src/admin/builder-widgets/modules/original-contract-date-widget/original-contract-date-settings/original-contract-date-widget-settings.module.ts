import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OriginalContractDateSettingsComponent } from "./original-contract-date-settings.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NzFormModule } from "@gs/ng-horizon/form";
import { NzSelectModule } from "@gs/ng-horizon/select";
import { NzInputModule } from "@gs/ng-horizon/input";
import { NzI18nModule } from '@gs/ng-horizon/i18n';

@NgModule({
    declarations: [OriginalContractDateSettingsComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
        NzFormModule,
        NzInputModule,
        NzSelectModule,
        FormsModule,
        ReactiveFormsModule,
        NzI18nModule
    ],
    entryComponents: [OriginalContractDateSettingsComponent],
    exports: [OriginalContractDateSettingsComponent],
})
export class OriginalContractDateWidgetSettingsModule {}