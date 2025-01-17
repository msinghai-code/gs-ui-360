import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FieldTreeModule } from "@gs/gdk/field-tree";
import { SpinnerModule } from '@gs/gdk/spinner';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AssignComponent } from "./assign/assign.component";
import { RelationshipLayoutConfigurationComponent } from "./relationship-layout-configuration.component";
import { ConfigureComponent } from "./configure/configure.component";
import { SummaryRibbonConfigComponent } from "./configure/summary-ribbon-config/summary-ribbon-config.component";
import { ItemDropListModule } from '../../item-drop-list/item-drop-list.module';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ListViewConfigComponent } from "./configure/list-view-config/list-view-config.component";
import { CardViewConfigComponent } from "./configure/card-view-config/card-view-config.component";
import { CardViewModule } from '@gs/cs360-lib/src/common';
import { CanDeactivateConfig, RelationshipConfigurationResolverService } from "./relationship-layout-configuration.service";
import { Cs360SummaryRibbonModule } from '@gs/cs360-lib/src/common';
import { SectionListingModule } from '../../admin-sections/modules/shared/section-listing/section-listing.module';
import { SummaryRibbonFieldConfigurationModule } from "./configure/summary-ribbon-field-configuration/summary-ribbon-field-configuration.module";
import { SharedLayoutRouteOutletService } from "./relationship-layout-configuration.service";
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzCardModule } from '@gs/ng-horizon/card';
import { NzCheckboxModule } from '@gs/ng-horizon/checkbox';
import { NzCollapseModule } from '@gs/ng-horizon/collapse';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzDrawerModule } from '@gs/ng-horizon/drawer';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzStepsModule } from '@gs/ng-horizon/steps';
import { NzTabsModule } from '@gs/ng-horizon/tabs';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzI18nModule } from '@gs/ng-horizon/i18n';

const routes: Routes = [
  {
    path: ':configId',
    component: RelationshipLayoutConfigurationComponent,
    resolve: {
      data: RelationshipConfigurationResolverService
    },
    children: [
      {
        path: 'assign',
        component: AssignComponent,
        canDeactivate: [CanDeactivateConfig]
      },
      {
        path: 'configure',
        component: ConfigureComponent,
        children: [
          { path: '', redirectTo: 'views', pathMatch: 'full' },
          { path: 'views', component: SummaryRibbonConfigComponent },
          { path: 'list', component: ListViewConfigComponent },
          { path: 'card', component: CardViewConfigComponent }
        ],
        canDeactivate: [CanDeactivateConfig]
      }
    ]
  }
];

@NgModule({
  declarations: [
    RelationshipLayoutConfigurationComponent,
    AssignComponent,
    ConfigureComponent,
    SummaryRibbonConfigComponent,
    ListViewConfigComponent,
    CardViewConfigComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerModule,
    RouterModule.forChild(routes),
    NzModalModule,
    NzTabsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzStepsModule,
    NzFormModule,
    NzTypographyModule,
    NzCheckboxModule,
    NzEmptyModule,
    FlexLayoutModule,
    FieldTreeModule,
    NzSkeletonModule,
    ItemDropListModule,
    DragDropModule,
    CardViewModule,
    NzCardModule,
    Cs360SummaryRibbonModule,
    NzCollapseModule,
    SectionListingModule,
    SummaryRibbonFieldConfigurationModule,
    NzI18nModule,
    NzDrawerModule
  ],
  providers: [SharedLayoutRouteOutletService, CanDeactivateConfig]
})
export class RelationshipLayoutConfigurationModule { }
