import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzDrawerModule } from "@gs/ng-horizon/drawer";
import { CsmSummaryModule } from '@gs/cs360-lib/src/csm';
import { SummaryPreviewComponent } from "./summary-preview.component";
import { NzSelectModule } from "@gs/ng-horizon/select";
import { NzIconModule } from "@gs/ng-horizon/icon";
import { NzTypographyModule } from "@gs/ng-horizon/typography";
import { SpinnerModule } from '@gs/gdk/spinner';
import { NzI18nModule } from "@gs/ng-horizon/i18n";
import { NzRadioModule } from '@gs/ng-horizon/radio';
import {NzModalModule} from "@gs/ng-horizon/modal";
@NgModule({
    declarations: [SummaryPreviewComponent],
    imports: [
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        CsmSummaryModule,
        NzDrawerModule,
        NzSelectModule,
        NzIconModule,
        NzTypographyModule,
        SpinnerModule,
        NzRadioModule,
        NzI18nModule,
        NzModalModule
    ],
    exports: [SummaryPreviewComponent]
})
export class SummaryPreviewModule {

}
