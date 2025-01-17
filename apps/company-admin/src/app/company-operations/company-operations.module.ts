import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilterQueryBuilderModule } from '@gs/gdk/filter/builder';
import { ColumnChooserModule } from '@gs/gdk/column-chooser';
import { NzPopoverModule } from '@gs/ng-horizon/popover';
import { SpinnerModule } from '@gs/gdk/spinner';
import { GridModule} from "@gs/gdk/grid";
import { DescribeService } from "@gs/gdk/services/describe";
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { ActionsHeaderComponent } from './actions-header/actions-header.component';
import {
  MAT_LABEL_GLOBAL_OPTIONS,
  MatAutocompleteModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatSnackBarModule,
  MatMenuModule
} from '@angular/material';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromCompanies from './state/companies.reducer';
import { CompaniesEffects } from './state/companies.effects';
import { CompaniesFacade } from './state/companies.facade';
import { CompanyUpsertComponent } from './company-upsert/company-upsert.component';
import { UpsertModule } from '../upsert/upsert.module';
import { RouterModule, Route } from '@angular/router';
import { CompanyUpsertResolverService } from './company-upsert-resolver.service';
import { DeleteConfirmationComponent } from './delete-confirmation/delete-confirmation.component';
import { CompanyOperationsBaseComponent } from './company-operations-base/company-operations-base.component';
import { LogsModule } from './merge-logs/logs.module';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzIconModule } from "@gs/ng-horizon/icon";
import { NzCheckboxModule } from "@gs/ng-horizon/checkbox";
import {NzI18nModule} from "@gs/ng-horizon/i18n";
import { MergeDialogComponent } from './merge/merge-dialog.component';
import {
    DateFloatingFilterComponent,
    DropdownFloatingFilterComponent,
    NumberFloatingFilterComponent,
    TextFloatingFilterComponent
} from "@gs/gdk/grid";
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzListModule } from "@gs/ng-horizon/list";
import { ObjectFilterQueryModule } from '@gs/gdk/filter/builder';
import {NzDropDownModule} from "@gs/ng-horizon/dropdown";
import { NzBadgeModule } from '@gs/ng-horizon/badge';

const APP_Routes: Route[] = [
  { path: '', component: ListComponent},
  { path: 'upsert', component: CompanyUpsertComponent, resolve: {data: CompanyUpsertResolverService}},
  { path: 'merge',  loadChildren: () => import ('./merge/merge.module').then(m => m.MergeModule) }
];

@NgModule({
  declarations: [ListComponent, 
    ActionsHeaderComponent, 
    DeleteConfirmationComponent,
    CompanyOperationsBaseComponent,
    CompanyUpsertComponent,
    MergeDialogComponent],
    imports: [
        BrowserModule,
        LogsModule,
        BrowserAnimationsModule,
        CommonModule,
        UpsertModule,
        ColumnChooserModule,
        SpinnerModule,
        NzPopoverModule,
        MatSnackBarModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatInputModule,
        MatNativeDateModule,
        RouterModule.forChild(APP_Routes),
        FilterQueryBuilderModule,
        HttpClientModule,
        GridModule,
        StoreModule.forFeature(
            fromCompanies.COMPANIES_FEATURE_KEY,
            fromCompanies.reducer
        ),
        EffectsModule.forFeature([CompaniesEffects]),
        NzI18nModule,
        NzModalModule,
        NzButtonModule,
        ObjectFilterQueryModule,
        NzIconModule,
        NzCheckboxModule,
        NzListModule,
        NzDropDownModule,
        NzBadgeModule
    ],
  entryComponents: [DeleteConfirmationComponent, MergeDialogComponent, DateFloatingFilterComponent, TextFloatingFilterComponent, NumberFloatingFilterComponent],
  providers: [
    CompanyUpsertResolverService,
    { provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: { float: 'never' } },
    CompaniesFacade,
    DescribeService
  ],
  bootstrap: []
})
export class CompanyOperationsModule {}
