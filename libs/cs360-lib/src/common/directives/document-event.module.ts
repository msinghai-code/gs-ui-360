import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutofocusDirective, DocumentEventDirective } from './document-event.directive';

@NgModule({
    declarations: [DocumentEventDirective, AutofocusDirective],
    imports: [
        CommonModule
    ],
    exports: [DocumentEventDirective, AutofocusDirective],
    providers: []
})
export class DocumentEventModule { }
