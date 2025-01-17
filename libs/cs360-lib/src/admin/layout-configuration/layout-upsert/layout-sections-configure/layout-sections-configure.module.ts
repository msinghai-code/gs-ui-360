import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerModule } from '@gs/gdk/spinner';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NzCollapseModule } from '@gs/ng-horizon/collapse';
import { LayoutSectionsConfigureComponent } from './layout-sections-configure.component';
import { GridsterModule } from 'angular-gridster2';
import { SectionListingModule } from '../../../admin-sections/modules/shared/section-listing/section-listing.module';
import { SharedPipesModule } from '@gs/cs360-lib/src/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzTagModule } from '@gs/ng-horizon/tag';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzFormModule } from '@gs/ng-horizon/form';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzModalModule } from '@gs/ng-horizon/modal';
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { AddAssociationModule } from '../../layout-listing/configurations/object-associations/add-association/add-association.module';
import { NzI18nModule } from '@gs/ng-horizon/i18n';
import { LayoutPreviewModule } from '../../layout-preview/layout-preview.module';

@NgModule({
  declarations: [
    LayoutSectionsConfigureComponent
  ],
  imports: [
    CommonModule,
    GridsterModule,
    SpinnerModule,
    NzInputModule,
    FlexLayoutModule,
    NzFormModule,
    FormsModule,
    NzModalModule,
    NzTagModule,
    NzEmptyModule,
    ReactiveFormsModule,
    NzIconModule,
    NzButtonModule,
    NzTypographyModule,
    DragDropModule,
    NzToolTipModule,
    SectionListingModule,
    AddAssociationModule,
    SharedPipesModule,
    NzI18nModule,
    NzCollapseModule,
    LayoutPreviewModule
  ],
  exports: [LayoutSectionsConfigureComponent],
  providers: [
  ]
})
export class LayoutSectionsConfigureModule {
}
