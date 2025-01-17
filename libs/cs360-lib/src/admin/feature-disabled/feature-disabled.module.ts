import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import {FeatureDisabledComponent} from "./feature-disabled.component";
import { NzResultModule } from '@gs/ng-horizon/result';


@NgModule({
    declarations: [FeatureDisabledComponent],
    imports: [
        RouterModule,
        NzResultModule
    ],
    exports: [FeatureDisabledComponent]
})
export class FeatureDisabledModule {
    
}
