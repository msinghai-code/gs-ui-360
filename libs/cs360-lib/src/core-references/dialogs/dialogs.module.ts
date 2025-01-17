import {ModuleWithProviders, NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {AlertComponent} from "./alert.component";
import {PromptComponent} from "./prompt.component";
import {ConfirmComponent} from "./confirm.component";
import {DialogHostComponent} from "./dialog-host.component";

import {DialogManagementService} from "./dialog-manager.service";
import {OverlayManagerService} from "./overay-manager.service";
import {OverlayModule} from "@angular/cdk/overlay";

import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
    MatInputModule,
    MatDialogModule,
    // NOTE: Adding date picker to the dialogs module. caveat is, if you dont add it here,
    // whenever there is a popup and popup has an input type date in it,
    // angular is throwing MatDatepickerContent is not found in the factory
    // (have you added it to the entry components?) and stuff.
    MatDatepickerModule
  ],
  entryComponents: [AlertComponent, ConfirmComponent, PromptComponent, DialogHostComponent],
  exports: [AlertComponent, ConfirmComponent, PromptComponent, DialogHostComponent],
  declarations: [AlertComponent, ConfirmComponent, PromptComponent, DialogHostComponent]
})
export class DialogModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DialogModule,
      providers: [DialogManagementService, OverlayManagerService]
    };
  }
}
