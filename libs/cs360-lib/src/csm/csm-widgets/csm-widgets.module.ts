import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GsUploaderModule } from '@gs/cs360-lib/src/core-references';
import { GsRteModule } from '@gs/gdk/rte';
import { SpinnerModule } from '@gs/gdk/spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularResizedEventModule } from "angular-resize-event";
import { LazyElementsModule } from '@angular-extensions/elements';
import { AttributeWidgetModule } from './modules/attribute-widget/attribute-widget.module';
import { DefaultThreeLevelWidgetModule } from './modules/default-three-level-widget/default-three-level-widget.module';
import { DefaultWidgetComponent, FirstChar } from './modules/default-widget/default-widget.component';
import { CustomerJourneyWidgetProvider } from './providers/CSMCustomerJourneyWidgetProvider';
import { ImageWidgetCsmModule } from './modules/image-widget/image-widget-csm.module';
import { CustomerJourneyModule } from './modules/customer-journey/customre-journey.module';
import { SummaryReportWidgetModule } from '@gs/cs360-lib/src/common';
import { FieldWidgetModule } from './modules/field-widget/field-widget.module';
import { CsmWidgetBaseComponent } from './modules/csm-widget-base/csm-widget-base.component';
import { CsatWidgetModule } from './modules/csat-widget/csat-widget.module';
import { ChartWidgetModule } from './modules/chart-widget/chart-widget.module';
import { BasicInsightsWidgetModule } from './modules/basic-insights-widget/basic-insights-widget.module';
import { NpsWidgetModule } from './modules/nps-widget/nps-widget.module';
import { TimelineWidgetLoaderComponent } from './providers/CSMTimelineWidgetProvider';
import { CompanyIntelligenceWidgetModule } from './modules/ci-widget/ci-widget.module';
import { HealthScoreWidgetModule } from './modules/healthscore-widget/healthscore-widget.module';
import { NzEmptyModule } from '@gs/ng-horizon/empty';
import { NzSkeletonModule } from '@gs/ng-horizon/skeleton';
import { NzAvatarModule } from '@gs/ng-horizon/avatar';
import { CustomColumnChartWidgetModule } from './modules/custom-column-chart-widget/custom-column-chart-widget.module';
import {LeadsWidgetModule} from "./modules/leads-widget/leads-widget.module";
import { NzTypographyModule } from '@gs/ng-horizon/typography';
import { NzToolTipModule } from '@gs/ng-horizon/tooltip';
import { ShowIfEllipsisModule } from "@gs/cs360-lib/src/common";
// import { SharedModule } from '@gs/cs360-lib/src/common';
import { AttributeFieldEditorWrapperModule } from '../attribute-field-editor-wrapper/attribute-field-editor-wrapper.module';

import { CommunityWidgetModule } from './modules/community-widget/community-widget.module';
import { CommunityWidgetProvider } from './providers/CSMCommunityWidgetProvider';
import { CustomerHighlightsWidgetModule } from './modules/customer-highlights-widget/customer-highlights-widget.module';
import { ChartVisualizerModule } from '@gs/gdk/visualizer/chart-visualizer';
import { ReportViewerModule } from '@gs/report/report-viewer';
import { NzDateLiteralPickerModule } from '@gs/ng-horizon/date-literal-picker';
import { NzIconModule } from "@gs/ng-horizon/icon";
import { NzDropDownModule } from '@gs/ng-horizon/dropdown';
import { DatePipe } from '@angular/common';
import {NzI18nModule} from "@gs/ng-horizon/i18n";
import {FlexLayoutModule} from "@angular/flex-layout";


const WIDGET_COMPONENTS = [
    DefaultWidgetComponent,
    CsmWidgetBaseComponent,
    TimelineWidgetLoaderComponent,
];

@NgModule({
    declarations: [
        ...WIDGET_COMPONENTS, FirstChar
    ],
    imports: [
        CommonModule,
        FormsModule,
        SpinnerModule,
        GsRteModule,
        AngularResizedEventModule,
        GsUploaderModule,
        ReactiveFormsModule,
        LazyElementsModule,
        NzSkeletonModule,
        NzTypographyModule,
        NzEmptyModule,
        CustomerJourneyModule,
        CommunityWidgetModule,
        AttributeWidgetModule,
        ImageWidgetCsmModule,
        DefaultThreeLevelWidgetModule,
        SummaryReportWidgetModule,
        FieldWidgetModule,
        ChartWidgetModule,
        CsatWidgetModule,
        BasicInsightsWidgetModule,
        NpsWidgetModule,
        CompanyIntelligenceWidgetModule,
        HealthScoreWidgetModule,
        NzAvatarModule,
        CustomColumnChartWidgetModule,
        LeadsWidgetModule,
        ShowIfEllipsisModule,
        NzToolTipModule,
        // SharedModule,
        NzToolTipModule,
        AttributeFieldEditorWrapperModule,
        NzToolTipModule,
        CustomerHighlightsWidgetModule,
        ChartVisualizerModule,
        ReportViewerModule,
        NzDateLiteralPickerModule,
        NzIconModule,
        NzDropDownModule,
        CustomerHighlightsWidgetModule,
        NzI18nModule,
        FlexLayoutModule
    ],
    exports: [
        ...WIDGET_COMPONENTS
    ],
    entryComponents: [
        ...WIDGET_COMPONENTS
    ],
    providers: [
        CustomerJourneyWidgetProvider,
        CommunityWidgetProvider,
        DatePipe
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CsmWidgetsModule { }
