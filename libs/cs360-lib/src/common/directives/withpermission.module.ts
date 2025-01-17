import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WithpermissionDirective } from './withpermission.directive';

@NgModule({
    declarations: [WithpermissionDirective],
    imports: [
        CommonModule
    ],
    exports: [WithpermissionDirective],
    providers: []
})
export class WithpermissionModule { }
