import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NzButtonModule } from "@gs/ng-horizon/button";
import { Gs404NotFoundComponent } from "./404-not-found.component";


@NgModule({
    declarations: [Gs404NotFoundComponent],
    imports: [
        NzButtonModule,
        RouterModule
    ],
    exports: [Gs404NotFoundComponent]
})
export class Gs404NotFoundModule {
    
}