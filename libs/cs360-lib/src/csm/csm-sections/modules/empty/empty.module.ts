import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyComponent } from './empty.component';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
@NgModule({
    declarations: [EmptyComponent],
    imports: [
        CommonModule,
        NzEmptyModule,
        NzTypographyModule,
        FlexLayoutModule,
        NzI18nModule
    ],
    entryComponents: [EmptyComponent],
    exports: [EmptyComponent]
})
export class EmptyModule { }
