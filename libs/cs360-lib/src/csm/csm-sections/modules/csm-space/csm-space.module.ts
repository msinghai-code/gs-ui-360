import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyElementsModule } from '@angular-extensions/elements';
import { CsmSpaceComponent } from './csm-space.component';

@NgModule({
    declarations: [CsmSpaceComponent],
    imports: [
        CommonModule,
        LazyElementsModule
    ],
    entryComponents: [CsmSpaceComponent],
    exports: [CsmSpaceComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmSpaceModule {
    static entry = CsmSpaceComponent;
 }
