import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { ImageWidgetBuilderComponent } from './image-widget-builder.component';
import { DocumentEventModule } from '@gs/cs360-lib/src/common';

@NgModule({
  declarations: [ImageWidgetBuilderComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NzIconModule,
    DocumentEventModule
  ],
  entryComponents : [ImageWidgetBuilderComponent],
  exports: [ImageWidgetBuilderComponent]
})
export class ImageWidgetBuilderModule { }
