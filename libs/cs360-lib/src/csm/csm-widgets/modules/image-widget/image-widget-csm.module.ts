import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageWidgetCsmComponent } from './image-widget-csm.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GsUploaderModule } from '@gs/cs360-lib/src/core-references';
import { SpinnerModule } from '@gs/gdk/spinner';
import { UploadImageComponent } from './upload-image/upload-image.component';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzDropDownModule } from '@gs/ng-horizon/dropdown';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import {NzI18nModule} from "@gs/ng-horizon/i18n";
import {NzTypographyModule} from "@gs/ng-horizon/typography";

@NgModule({
    declarations: [ImageWidgetCsmComponent, UploadImageComponent,],
    imports: [
        CommonModule,
        FlexLayoutModule,
        NzIconModule,
        NzDropDownModule,
        GsUploaderModule,
        NzDrawerModule,
        NzButtonModule,
        SpinnerModule,
        NzToolTipModule,
        NzI18nModule,
        NzTypographyModule
    ],
  entryComponents: [ImageWidgetCsmComponent, UploadImageComponent],
  exports: [ImageWidgetCsmComponent]
})
export class ImageWidgetCsmModule { }
