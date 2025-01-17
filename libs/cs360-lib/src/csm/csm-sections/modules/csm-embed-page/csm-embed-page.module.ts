import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CsmEmbedPageComponent } from './csm-embed-page.component';
import { EmptyModule } from '../empty/empty.module';
import { UserMetaService } from '@gs/gdk/services/user-meta';
import { SpinnerModule } from '@gs/gdk/spinner';

@NgModule({
  declarations: [CsmEmbedPageComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    EmptyModule,
    SpinnerModule
  ],
  entryComponents: [CsmEmbedPageComponent],
  exports: [CsmEmbedPageComponent],
  providers: [UserMetaService]
})
export class CsmEmbedPageModule {
  static entry = CsmEmbedPageComponent;
}
