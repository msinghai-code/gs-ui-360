import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CONTEXT_INFO, PX_CUSTOM_EVENTS, PxService, SectionStateService, WidgetTypes, isMini360 } from '@gs/cs360-lib/src/common';
import { CsmSummaryService } from '../../../csm-sections/modules/csm-summary/csm-summary.service';
import { CsmWidgetBaseComponent } from '../csm-widget-base/csm-widget-base.component';
import {merge} from "lodash"
import { Router } from '@angular/router';
import { GROUPBY_DATE, DURATION_DATE_LITERALS } from '@gs/cs360-lib/src/common';
import { DatePipe } from '@angular/common';
import { getCdnPath } from "@gs/gdk/utils/cdn";
import { NzIconService } from '@gs/ng-horizon/icon';
import { NzI18nService } from "@gs/ng-horizon/i18n";
import { CS360CacheService } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-default-widget',
  templateUrl: './default-widget.component.html',
  styleUrls: ['./default-widget.component.scss']
})
export class DefaultWidgetComponent extends CsmWidgetBaseComponent implements OnInit {

  isTooltipVisible = false; 
  dataConfig: any = {};
  endDate: string;
  duration: number;
  startDate: string;
  isDatesRequired: boolean = false;
  response:any;
  loading: boolean = true;
  labels = {
    "this_month": "MONTHLY",
    "current_cy": "YEARLY",
    "this_week":"WEEKLY",
    "current_cyq": "QUARTERLY",
    "LAST_N_MONTHS": "LAST_N_MONTHS",
    "LAST_N_WEEKS": "LAST_N_WEEKS",
    "LAST_N_QUARTERS": "LAST_N_QUARTERS",
    "LAST_N_YEARS": "LAST_N_YEARS",
    "CUSTOM": "CUSTOM"
  };
  gsid: string;
  dateLiteralValue = [];
  customLiteralLabel:string = '';
  apiResponse: any;
  arrWithHistory: string = 'ARR_WITH_HISTORY';
  errorMsg: string;
  dateLiteralPlaceHolder: string;
  isMini360:boolean = false;


  constructor(csmSummaryService: CsmSummaryService, private iconService: NzIconService, @Inject(CONTEXT_INFO) public ctx, protected stateService: SectionStateService, public pxService: PxService, private router: Router, public attrService: CSMAttributeService, private datePipe: DatePipe, private i18nService: NzI18nService,private cs360CacheService: CS360CacheService) {
    super(csmSummaryService, ctx);
    this.isMini360 = isMini360(this.ctx);
    console.log('field widget', this.attrService.treeData)
  }

  tooltipVisible(evt:any){
    this.isTooltipVisible = evt; 
  }

  calculateStartDate(evt) {
    const startDate = new Date();

    switch (evt.dateLiteral) {
      case 'LAST_N_WEEKS':
        startDate.setDate(startDate.getDate() - evt.value[0] * 7);
        break;
      case 'LAST_N_MONTHS':
        startDate.setMonth(startDate.getMonth() - evt.value[0]);
        break;
      case 'LAST_N_QUARTERS':
        startDate.setMonth(startDate.getMonth() - evt.value[0] * 3);
        break;
      case 'LAST_N_YEARS':
        startDate.setFullYear(startDate.getFullYear() - evt.value[0]);
        break;
      default:
        break;
    }

    this.startDate = this.datePipe.transform(startDate, 'yyyy-MM-dd');
    return this.startDate;
  }


  preparePayload(isDateLiteralChange = false, isSummarizeFunctionChange = false, dateLiteral = '', startDate = '', endDate = '', value?, customLiteral?: string) {
    const selectedDateLiteral = isDateLiteralChange ? dateLiteral : this.labels[this.dataConfig.selectedDateDuration.dateLiteral];
    const selectedGroupByDatesLiteral = isSummarizeFunctionChange ? dateLiteral : this.dataConfig.selectedGroupByDates.dateLiteral;

    const payload = {
      gsid: this.ctx[this.gsid],
      dateLiteral: selectedDateLiteral,
      summarizeFunction: selectedGroupByDatesLiteral,
      field: 'Arr',
      objectName: this.ctx.baseObject,
      startDate,
      endDate,
    };

    this.stateService.saveState(
      {
        referenceId: "ARR_WITH_HISTORY",
        state: {...payload, value: value || this.dateLiteralValue, customLiteral: customLiteral || this.customLiteralLabel}
      }
      ).subscribe();

    this.csmSummaryService.getDataArrWithHistory(payload, true).subscribe((res: any) => {
      this.response = JSON.parse(JSON.stringify(res.data));
      this.loading = false;
      this.errorMsg = !res.success ? res.error.message : this.i18nService.translate('reports.grid.message.change_filter');
      return res.data;
    });
  }


  loadCompleteEvent(evt){
    console.log(evt, "evt");
  }

  onDurationDateChange(evt) {
  this.loading = true;

  if (evt.value.length > 0) {
    const differenceInDays = Math.floor((new Date(evt.value[1]).getTime() - new Date(evt.value[0]).getTime()) / (24 * 60 * 60 * 1000));
    const dateLiteralCustom = evt.dateLiteral === 'CUSTOM';

    switch (true) {
      case differenceInDays > 365:
        evt.dateLiteral = 'LAST_N_YEARS';
        break;
      case differenceInDays > 90:
        evt.dateLiteral = 'LAST_N_QUARTERS';
        break;
      case differenceInDays > 30:
        evt.dateLiteral = 'LAST_N_MONTHS';
        break;
      case differenceInDays > 7:
        evt.dateLiteral = 'LAST_N_WEEKS';
        break;
        case differenceInDays < 7:
        evt.dateLiteral = 'this_week';
        break;
    }

    this.isDatesRequired = true;
    this.dataConfig.groupByDatesConfig = GROUPBY_DATE[evt.dateLiteral];
    this.dataConfig.selectedGroupByDates = { dateLiteral: this.dataConfig.groupByDatesConfig[0].value, value: [] };

    const endDate = dateLiteralCustom ? this.datePipe.transform(evt.value[1], 'yyyy-MM-dd') : this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    const startDate = dateLiteralCustom ? this.datePipe.transform(evt.value[0], 'yyyy-MM-dd') : this.calculateStartDate(evt);

    this.endDate = endDate;
    this.startDate = startDate;
    this.dateLiteralValue = evt.value;
    this.customLiteralLabel = evt.dateLiteral;
    this.dataConfig.data = this.preparePayload(true, false, dateLiteralCustom ? 'CUSTOM' : this.labels[evt.dateLiteral], startDate, endDate, evt.value, evt.dateLiteral);
    evt.dateLiteral = dateLiteralCustom ? 'CUSTOM' : evt.dateLiteral;

  } else {
    this.isDatesRequired = false;
    this.dataConfig.groupByDatesConfig = GROUPBY_DATE[evt.dateLiteral];
    this.dataConfig.selectedGroupByDates = { dateLiteral: this.dataConfig.groupByDatesConfig[0].value, value: [] };
    this.dataConfig.data = this.preparePayload(true, false, this.labels[evt.dateLiteral], '', '', evt.value);
  }
}

  onGroupByDateChange($event){
    this.loading  = true;
    this.endDate = this.endDate || this.apiResponse && this.apiResponse.endDate || "";
    this.startDate = this.startDate || this.apiResponse && this.apiResponse.startDate || "";
    const dateLiteralValue = (this.dateLiteralValue.length > 0 ? this.dateLiteralValue : this.apiResponse && this.apiResponse.value || '');
    this.dataConfig.data = this.isDatesRequired ? this.preparePayload(false, true, $event.dateLiteral, this.startDate, this.endDate, dateLiteralValue, this.customLiteralLabel || this.apiResponse && this.apiResponse.customLiteral) : this.preparePayload(false, true, $event.dateLiteral, this.startDate, this.endDate, dateLiteralValue, this.customLiteralLabel || this.apiResponse && this.apiResponse.customLiteral);
  }

  dataLoaded() {
    this.widgetItem.value = this.data;
    merge(this.widgetItem, this.widgetItem.config);
    this.widgetItem.isEditing = false;
    console.log(this.widgetItem , "this.widgetItem")
    if (this.widgetItem.subType === this.arrWithHistory) {
      this.isLoading = false;
      this.dateLiteralPlaceHolder = this.i18nService.translate('horizon.gdk.filter.filter-control.select_literal');
      this.gsid = this.ctx.entityContext || this.ctx.uniqueCtxId;
      this.stateService.getStateForAdmin(this.arrWithHistory).subscribe(res => {
        const state = res && res.state || { dateLiteral: 'YEARLY' , summarizeFunction: 'QUARTERS'};
        this.apiResponse = res && res.state
        const dateLiteral = state.dateLiteral === 'CUSTOM' ? state.customLiteral : state.dateLiteral;
        const summarizeFunction = state.summarizeFunction;

        const payload = {
            gsid: this.ctx[this.gsid],
            dateLiteral,
            summarizeFunction,
            field: "Arr",
            objectName: this.ctx.baseObject,
            endDate: state.endDate || "",
            startDate: state.startDate || "",
        };

        const customLiteral = state.dateLiteral === 'CUSTOM' ? state.customLiteral : Object.keys(this.labels).find(key => this.labels[key] === state.dateLiteral);

        this.dataConfig = {
            durationDatesConfig: [...DURATION_DATE_LITERALS],
            selectedDateDuration: { dateLiteral: Object.keys(this.labels).find(key => this.labels[key] === state.dateLiteral), value: state.value || [] },
            selectedGroupByDates: { dateLiteral: summarizeFunction, value: [] },
            groupByDatesConfig: GROUPBY_DATE[customLiteral],
        };

        this.csmSummaryService.getDataArrWithHistory(payload).subscribe((res: any) => {
            this.dataConfig.data = res.data;
            this.loading = false;
            this.response = JSON.parse(JSON.stringify(this.dataConfig.data));
            this.errorMsg = !res.success ? res.error.message : this.i18nService.translate('reports.grid.message.change_filter');
        });
    });
  }
  }
  onUpdate(event) {
    if (event.type === 'SAVE') {
      const source = this.widgetItem.dataType === WidgetTypes.RICHTEXTAREA ? WidgetTypes.RICHTEXTAREA_EDIT : WidgetTypes.FIELD_WIDGET;
      this.pxService.pxAptrinsic(PX_CUSTOM_EVENTS.DATA_EDIT, {Source: source});
      this.csmSummaryService.saveAttribute(event.payload, event.entityId, event.entityType, event.dataEditEntityId);
    }
  }

  navigateToRoute(event) {
    if (!(['.field-edit-hover', '.gs-form'].some(selector => event.target.closest(selector)) || this.widgetItem.editable)) {
      this.pxService.pxAptrinsic(PX_CUSTOM_EVENTS.WIDGET_REDIRECTION, {Source: WidgetTypes.FIELD_WIDGET});
      const navigationConfig = this.widgetItem && this.widgetItem.properties && this.widgetItem.properties.navigationConfig || null;
      console.log(navigationConfig + "navigationConfig")
      if(navigationConfig &&  navigationConfig !== "NONE") {
        if(!isMini360(this.ctx)) {
          this.router.navigate([`/${navigationConfig}`]);
        } else {
          this.cs360CacheService.navigateToTab({}, navigationConfig);
        }
      }
    }
  }
}


import { Pipe, PipeTransform } from '@angular/core';
import {CSMAttributeService} from "../../../csm-sections/modules/csm-attribute/csm-attribute.service";
import { NzI18nPipe } from '@gs/ng-horizon/i18n';


@Pipe({
  name: 'firstChar'
})
export class FirstChar implements PipeTransform
{
    transform(value: string): string | boolean
    {
        if (!value) {return '';}
        const values = value.split('');
        if(values && values.length){
          return value.split('')[0].toUpperCase();
        }else{
          return '';
        }
       
    }
}
