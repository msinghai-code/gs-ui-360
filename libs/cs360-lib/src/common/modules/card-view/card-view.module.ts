import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterModule } from 'angular-gridster2';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzCardModule } from '@gs/ng-horizon/card';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { CardViewComponent } from "./card-view.component";
import { HealthScoreWrapModule } from '../health-score/health-score.module';
import { URLPipeModule } from "@gs/cs360-lib/src/core-references";
import { GsMappingRendererComponent } from "./gs-mapping-renderer.component";
import { ExternalLinkModule } from '../../directives/open-new-tab.directive';
import { Gs360AppLinkModule } from "@gs/gdk/directives";

@NgModule({
    declarations: [CardViewComponent, GsMappingRendererComponent],
    imports: [
        CommonModule,
        GridsterModule,
        DragDropModule,
        NzEmptyModule,
        NzIconModule,
        NzButtonModule,
        NzTypographyModule,
        NzCardModule,
        FlexLayoutModule,
        HealthScoreWrapModule,
        URLPipeModule,
        NzToolTipModule,
        ExternalLinkModule,
        Gs360AppLinkModule
    ],
    exports: [CardViewComponent]
})
export class CardViewModule { }