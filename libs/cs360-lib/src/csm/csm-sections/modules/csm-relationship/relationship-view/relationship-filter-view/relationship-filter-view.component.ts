import {Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';

import {ReportUtils, ReportFilterUtils} from "@gs/report/utils";
import {operatorTranslation} from "../../../../../operator/operator-translation";
import { StateAction, HostInfo } from '@gs/gdk/core';
import { GSField } from "@gs/gdk/core";
import { DescribeService } from "@gs/gdk/services/describe";
import {isEmpty, cloneDeep} from "lodash";
import {CONTEXT_INFO, Cs360ContextUtils, ICONTEXT_INFO} from '@gs/cs360-lib/src/common';
import { FIELD_TREE_DEFAULT_SEARCH_SETTINGS } from '@gs/cs360-lib/src/common';
import { EnvironmentService, UserService } from '@gs/gdk/services/environment';
import {FilterQueryBuilderComponent} from "@gs/gdk/filter/builder";
import { TranslocoService } from '@ngneat/transloco';
@Component({
  selector: 'gs-relationship-filter-view',
  templateUrl: './relationship-filter-view.component.html',
  styleUrls: ['./relationship-filter-view.component.scss']
})
export class RelationshipFilterViewComponent implements OnInit {

  @Input() allowedFields: any[] = [];

  @Input() filters: any;

  @Input() readOnlyFilter: any;

  @Output() action = new EventEmitter<StateAction>();

  @ViewChild(FilterQueryBuilderComponent, {static: false}) customFilterQueryBuilderComponent: FilterQueryBuilderComponent;

  public host: HostInfo = ReportUtils.getFieldTreeHostInfo(Cs360ContextUtils.getSourceDetailsForRelationship(this.translocoService));
  private objectName: string = Cs360ContextUtils.getRelationshipBaseObjectName();
  public config: any;
  public showErrors: boolean = false;
  public filterQueryBuilder = {
    filters: ReportFilterUtils.emptyFilters(),
    allowTargetFields: false,
    linkTargetFieldsToSourceType: false,
    maxNestLevels: 2,
    currencyConfig: {},
    strictCheckForExpression: false,
    sourceDetails: null,
    baseObject: null,
    source: {
      children: [],
      obj: {},
      label: ''
    },
    fieldSearchSetting: cloneDeep(FIELD_TREE_DEFAULT_SEARCH_SETTINGS),
    filterFunction: this.filterFunction.bind(this),
    error: {
      invalid: false,
      message: ""
    },
    show: false
  }

  constructor(@Inject("envService") private env: EnvironmentService,
              private ds: DescribeService,
              private userService: UserService,
              private translocoService: TranslocoService,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) { }

  ngOnInit() {
    this.bootstrapComponent();
    this.setSubscriptions();
  }

  private bootstrapComponent() {
    const host: any = this.env.instanceDetails;
    const user = this.getUserConfigByHostType();
    if (host) {
      const locale = host.locale;
      const currency = host.currency;
      const search = this.env.hostDetails.search;
      this.config = {
        locale,
        currency,
        search,
        user,
        nestOnDemand: true,
        showLookupInfo: true,
        enablePartialTree: true,
        pageSize: 200,
        // Added fiscal support.
        // dateLiterals: [{ value: "CUSTOM", label: "Custom" }],
        showCalender: true,
        // Added operator map
        operatorMap: operatorTranslation.getOperatorMap(),
        // Added includes null
        honorIncludeNulls: true,
        // Check for strictness of expression
        strictCheck: true,
        // Show skeleton
        showSkeleton: true,
        // showValidationsOnTouch: false
      };
    }
    this.filterQueryBuilder = {
      ...this.filterQueryBuilder,
      filters: isEmpty(this.filters) ? ReportFilterUtils.emptyFilters(): this.filters
    }
    // By default add Status field in filter.
    this.allowedFields.push({fieldName: 'Status', objectName: 'relationship'});
  }

  private setSubscriptions() {

    this.ds.getObjectTree(
        this.host,
        this.objectName,
        2,
        [],
        {
          skipFilter: true,
          filterFunction: this.filterFunction.bind(this),
          allowedFields: this.getAllowedFields(),
          flpOperationType: "READ"
        })
        .then((data) => {
          console.log(data);
          this.filterQueryBuilder = {
            ...this.filterQueryBuilder,
            source: {...data, label: "Relationship"},
            sourceDetails: Cs360ContextUtils.getSourceDetailsForRelationship(this.translocoService),
            show: true
          }
        });
  }

  private filterFunction(fields, allowedDataTypes, allowedFields, key): any {
    allowedFields = allowedFields && allowedFields.length ? allowedFields: this.allowedFields;
    return fields.filter((field: GSField) => {
      if(field.dataType === 'LOOKUP') return true;
      let retValue: boolean = true;
      const { dataType, fieldName, meta, objectName } = field;
      if (allowedDataTypes && allowedDataTypes.length) {
        retValue = meta.filterable && allowedDataTypes.map(d => d.toUpperCase()).indexOf(dataType.toUpperCase()) > -1;
      }
      if (retValue && allowedFields && allowedFields.length) {
        retValue = meta.filterable && allowedFields.some(f => f.fieldName === fieldName && f.objectName === objectName);
      }

      return retValue;
    });
  }

  private getAllowedFields(): string[] {
    return this.allowedFields;
  }

  statusUpdate(evt) {
    this.filterQueryBuilder.error = {
      ...this.filterQueryBuilder.error,
      invalid: evt.invalid
    }
  }

  getOperatorlabel(type: string = 'STRING', op: string): string {
    const OM = ReportFilterUtils.getOperatorMap();
    return OM[type].find(o => o.value === op).label;
  }

  isInvalid(): boolean {
    this.showErrors = this.customFilterQueryBuilderComponent.validateRules().invalid;
    return this.customFilterQueryBuilderComponent.validateRules().invalid;
  }

  serialize() {
    if(this.isInvalid()) {
      return {
        type: "SAVE_FILTERS",
        payload: { error: true }
      }
    } else {
      return {
        type: "SAVE_FILTERS",
        payload: this.customFilterQueryBuilderComponent.serialize()
      }
    }
  }

  /**
   * Get user config details.
   */
  getUserConfigByHostType(): any {
    return !!this.host && this.host.type === 'SFDC'
        ? this.env.user
        : (!isEmpty(this.userService.gsUser) ? this.userService.gsUser: this.env.user);
  }

}
