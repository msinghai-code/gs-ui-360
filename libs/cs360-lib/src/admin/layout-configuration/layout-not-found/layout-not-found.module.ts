import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NzButtonModule } from "@gs/ng-horizon/button";
import { LayoutNotFoundComponent } from "./layout-not-found.component";
import { Gs404NotFoundModule } from '@gs/cs360-lib/src/common';
import { NzI18nModule } from "@gs/ng-horizon/i18n";


@NgModule({
    declarations: [LayoutNotFoundComponent],
    imports: [
        NzButtonModule,
        RouterModule,
        Gs404NotFoundModule,
        NzI18nModule
    ],
    exports: [LayoutNotFoundComponent]
})
export class LayoutNotFoundModule {
    
}