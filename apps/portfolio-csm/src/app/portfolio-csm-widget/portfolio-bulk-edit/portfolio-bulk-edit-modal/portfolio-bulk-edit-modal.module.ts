import {NgModule} from "@angular/core";
import {PortfolioBulkEditModalComponent} from "./portfolio-bulk-edit-modal.component";
import {NzGridModule} from "@gs/ng-horizon/grid";
import {NzSelectModule} from "@gs/ng-horizon/select";
import {NzInputModule} from "@gs/ng-horizon/input";
import {NzIconModule} from "@gs/ng-horizon/icon";
import {FormsModule} from "@angular/forms";
import {FieldEditorModule} from "@gs/portfolio-lib";
import {NzI18nModule} from "@gs/ng-horizon/i18n";
import {CommonModule} from "@angular/common";

@NgModule({
  declarations: [PortfolioBulkEditModalComponent],
  imports: [
    NzGridModule,
    NzSelectModule,
    NzInputModule,
    NzIconModule,
    FormsModule,
    FieldEditorModule,
    NzI18nModule,
    CommonModule
  ],
  exports: [PortfolioBulkEditModalComponent],
  entryComponents: [PortfolioBulkEditModalComponent]
})

export class PortfolioBulkEditModalModule {
  static entry = PortfolioBulkEditModalComponent;
}
