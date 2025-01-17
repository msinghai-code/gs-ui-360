import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { RolloutExplorerComponent } from "./rollout-explorer.component";
import { FeatureExplorerComponent } from "./feature-explorer/feature-explorer.component";
import {NzI18nModule} from "@gs/ng-horizon/i18n";

@NgModule({
    declarations: [
        RolloutExplorerComponent,
        FeatureExplorerComponent
    ],
    imports: [
        CommonModule,
        NzTypographyModule,
        NzButtonModule,
        NzModalModule,
        NzIconModule,
        NzToolTipModule,
        NzI18nModule
    ],
    exports: [
        RolloutExplorerComponent,
        FeatureExplorerComponent
    ]
})
export class RolloutExplorerModule { }
