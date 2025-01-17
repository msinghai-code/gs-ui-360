import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickActionsComponent } from './quick-actions.component';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { QuickPersonModule } from './sections/quick-person/quick-person.module';
import { QuickCtaModule } from './sections/quick-cta/quick-cta.module';
import { QuickActionsService } from './quick-actions.service';
import { GenericHostDirectiveModule } from '@gs/cs360-lib/src/common';
import { QuickTimelineModule } from './sections/quick-timeline/quick-timeline.module';
import {QuickLeadModule} from "./sections/quick-lead/quick-lead.module";
import {QuickEnhancementRequestModule} from "./sections/quick-enhancement-request/quick-enhancement-request.module";
import {
  BaseQuickActionSectionRendererModule
} from "./base-quick-action-section-renderer/base-quick-action-section-renderer.module";

@NgModule({
  declarations: [QuickActionsComponent],
  imports: [
    CommonModule,
    NzModalModule,
    QuickPersonModule,
    QuickCtaModule,
    QuickTimelineModule,
    GenericHostDirectiveModule,
    QuickLeadModule,
    QuickEnhancementRequestModule,
    BaseQuickActionSectionRendererModule
  ],
  exports: [QuickActionsComponent],
  providers: [QuickActionsService]
})
export class QuickActionsModule { }
