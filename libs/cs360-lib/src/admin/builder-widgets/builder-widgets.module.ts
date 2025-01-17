import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GsUploaderModule } from '@gs/cs360-lib/src/core-references';
import { GsRteModule } from '@gs/gdk/rte';
import { FieldTreeModule } from "@gs/gdk/field-tree";
import { SpinnerModule } from '@gs/gdk/spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularResizedEventModule } from "angular-resize-event";
import { LazyElementsModule } from '@angular-extensions/elements';
import { AttributeWidgetModule } from './modules/attribute-widget/attribute-widget.module';
import { CustomerJourneyWidgetModule } from './modules/customer-journey/customer-journey-builder.module';
import { DefaultThreeLevelWidgetModule } from './modules/default-three-level-widget/default-three-level-widget.module';
import { ImageWidgetSettingsModule } from './modules/image-widget/image-widget-settings/image-widget-settings.module';
import { TextWidgetSettingsModule } from './modules/text-widget/text-widget-settings/text-widget-settings.module';
import { SummaryReportWidgetModule } from '@gs/cs360-lib/src/common';
import { FieldWidgetModule } from './modules/field-widget/field-widget.module';
import { DefaultWidgetModule } from './modules/default-widget/default-widget.module';
import { ImageWidgetBuilderModule } from './modules/image-widget/image-widget-builder.module';
import { TextWidgetBuilderModule } from './modules/text-widget/text-widget.module';
import { CockpitWidgetModule } from './modules/cockpit-widget/cockpit-widget.module';
import { TimelineWidgetModule } from './modules/timeline-widget/timeline-widget.module';
import { HealthscoreWidgetModule } from './modules/healthscore-widget/healthscore-widget.module';
import { NzButtonModule } from '@gs/ng-horizon/button';
import { NzDropDownModule } from '@gs/ng-horizon/dropdown';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzIconModule } from '@gs/ng-horizon/icon';
import { NzInputModule } from '@gs/ng-horizon/input';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { GridsterModule } from 'angular-gridster2';
import { OriginalContractDateWidgetSettingsModule } from './modules/original-contract-date-widget/original-contract-date-settings/original-contract-date-widget-settings.module';
import { CustomerHighlightsWidgetModule } from './modules/customer-highlights-widget/cutomer-highlights-widget.module';
import { BaseWidgetSettingsRendererModule } from "./base-widget-settings-renderer/base-widget-settings-renderer.module";
import { BaseWidgetRendererModule } from './base-widget-renderer/base-widget-renderer.module';

const WIDGET_COMPONENTS = [
    
];

@NgModule({
    declarations: [
        ...WIDGET_COMPONENTS,
    ],
    imports: [
        CustomerJourneyWidgetModule,
        CommonModule,
        FormsModule,
        SpinnerModule,
        GsRteModule,
        AngularResizedEventModule,
        GsUploaderModule,
        ReactiveFormsModule,
        LazyElementsModule,
        NzSkeletonModule,
        NzEmptyModule,
        NzIconModule,
        NzButtonModule,
        NzInputModule,
        NzDropDownModule,
        FieldTreeModule,
        AttributeWidgetModule,
        TextWidgetBuilderModule,
        TextWidgetSettingsModule,
        ImageWidgetBuilderModule,
        ImageWidgetSettingsModule,
        DefaultThreeLevelWidgetModule,
        SummaryReportWidgetModule,
        FieldWidgetModule,
        DefaultWidgetModule,
        CockpitWidgetModule,
        TimelineWidgetModule,
        HealthscoreWidgetModule,
        OriginalContractDateWidgetSettingsModule,
        CustomerHighlightsWidgetModule,
        BaseWidgetSettingsRendererModule,
        BaseWidgetRendererModule
    ],
    exports: [
        ...WIDGET_COMPONENTS
    ],
    entryComponents: [
        ...WIDGET_COMPONENTS
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BuilderWidgetModule { }
