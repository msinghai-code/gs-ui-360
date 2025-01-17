import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { NzSelectModule } from "@gs/ng-horizon/select";
import { NzIconModule } from "@gs/ng-horizon/icon";
import { NzTypographyModule } from "@gs/ng-horizon/typography";
import {PreviewBannerComponent} from "./preview-banner.component";
import {PreviewBannerService} from "./preview-banner.service";
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { NzRadioModule } from '@gs/ng-horizon/radio';

@NgModule({
  declarations: [PreviewBannerComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzIconModule,
    NzTypographyModule,
    NzI18nModule,
    NzRadioModule
  ],
  exports: [PreviewBannerComponent],
  providers: [PreviewBannerService]
})
export class PreviewBannerModule { }
