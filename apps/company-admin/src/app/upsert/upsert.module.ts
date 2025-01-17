import { NgModule } from '@angular/core';
import {
  ErrorReaderModule,
  TokenFieldModule
} from '@gs/core';
import { SpinnerModule } from '@gs/gdk/spinner';
import { UpsertComponent } from './upsert.component';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatStepperModule, MatButtonModule, MatInputModule, MatAutocompleteModule, MatSelectModule, MatDatepickerModule, MatTooltipModule } from '@angular/material';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { environment } from '../../environments/environment';
import { SidebarModule } from 'primeng/sidebar';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ng2-validation';
import { FieldEditorModule } from '../field-editor/field-editor.module';
import { NzTimePickerModule } from '@gs/ng-horizon/time-picker';
import { NxModule } from '@nrwl/angular';
import { EnvironmentModule } from "@gs/gdk/services/environment";
import {NzI18nModule} from "@gs/ng-horizon/i18n";

@NgModule({
  declarations: [UpsertComponent], // TODO: remove it from here
  imports: [
    CommonModule,
    FieldEditorModule,
    ReactiveFormsModule,
    SidebarModule,
    MatIconModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatTooltipModule,
    CustomFormsModule,
    ErrorReaderModule,
    // FormattersModule,
    TokenFieldModule,
    SpinnerModule,
    MatStepperModule,
    NzTimePickerModule,
    NxModule.forRoot(),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    StoreRouterConnectingModule.forRoot(),
    EnvironmentModule,
    NzI18nModule
  ],
  providers: [],
  exports: [UpsertComponent]
})
export class UpsertModule {}
