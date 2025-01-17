import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextWidgetComponent } from './text-widget.component';
import { FlexLayoutModule } from '@angular/flex-layout';
// import { QuillModule } from 'ngx-quill'
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DocumentEventModule } from '@gs/cs360-lib/src/common';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzStepsModule } from '@gs/ng-horizon/steps';
import { NzTypographyModule } from '@gs/ng-horizon/typography';

@NgModule({
  declarations: [TextWidgetComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NzIconModule,
    // QuillModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NzSkeletonModule, NzButtonModule, NzFormModule, NzInputModule, NzEmptyModule, NzModalModule, NzDrawerModule, NzCheckboxModule, NzTypographyModule, NzStepsModule,
    DocumentEventModule
  ],
  entryComponents: [TextWidgetComponent],
  exports: [TextWidgetComponent]
})
export class TextWidgetBuilderModule { }
