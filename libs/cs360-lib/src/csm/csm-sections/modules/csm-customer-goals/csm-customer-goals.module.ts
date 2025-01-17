import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyElementsModule } from '@angular-extensions/elements';
import { CsmCustomerGoalsComponent } from './csm-customer-goals.component';

@NgModule({
    declarations: [CsmCustomerGoalsComponent],
    imports: [
        CommonModule,
        LazyElementsModule
    ],
    entryComponents: [CsmCustomerGoalsComponent],
    exports: [CsmCustomerGoalsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmCustomerGoalsModule {
    static entry = CsmCustomerGoalsComponent;
}
