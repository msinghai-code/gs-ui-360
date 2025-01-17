import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EscapeHTMLPipe } from './escapeHTMLPipe';
import { SearchFilterPipe } from './searchFilterPipe';
import { CtxTranslatePipe } from './ctxTranslatePipe';

@NgModule({
    declarations: [EscapeHTMLPipe, SearchFilterPipe, CtxTranslatePipe],
    imports: [
        CommonModule
    ],
    exports: [EscapeHTMLPipe, SearchFilterPipe, CtxTranslatePipe],
    providers: []
})
export class SharedPipesModule { }
