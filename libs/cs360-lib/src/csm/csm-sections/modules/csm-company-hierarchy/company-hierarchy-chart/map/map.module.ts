import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map.component';
import { NzOverlayModule } from '@gs/ng-horizon/core';
import { NzPopoverModule } from '@gs/ng-horizon/popover';

@NgModule({
    declarations: [MapComponent],
    imports: [
        CommonModule, NzOverlayModule, NzPopoverModule
    ],
    exports: [MapComponent]
})

export class MapModule { }
