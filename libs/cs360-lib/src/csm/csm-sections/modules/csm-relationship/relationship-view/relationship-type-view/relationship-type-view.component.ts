import {Component, EventEmitter, Input, OnInit, Output, ViewChild, Inject} from '@angular/core';
import {CsmRelationshipService} from "../../csm-relationship.service";
import {compareFields} from "@gs/gdk/utils/field";
// import { ReportFilterUtils} from "@gs/core";
import { ReportFilterUtils} from "@gs/report/utils";
import { ReportFilterUtilsCore} from "@gs/cs360-lib/src/core-references";
import { fieldInfo2path } from "@gs/gdk/utils/field";
import { StateAction } from '@gs/gdk/core';
import {isEmpty, cloneDeep, uniqWith} from "lodash";
import {RelationshipListViewComponent} from "../relationship-list-view/relationship-list-view.component";
import { IRelationshipConfig } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import {RelationshipCardComponent} from "../../relationship-card/relationship-card.component";
import {RelationshipSummaryRibbonViewComponent} from "../relationship-summary-ribbon-view/relationship-summary-ribbon-view.component";
import { forkJoin } from "rxjs";
import { CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { MDA_HOST } from '@gs/cs360-lib/src/common';
import { DescribeService } from "@gs/gdk/services/describe";
import { isArray } from 'lodash';
import { isMini360 } from '@gs/cs360-lib/src/common/cs360.utils';

@Component({
  selector: 'gs-relationship-type-view',
  templateUrl: './relationship-type-view.component.html',
  styleUrls: ['./relationship-type-view.component.scss']
})
export class RelationshipTypeViewComponent implements OnInit {

  @Input() view: string;

  @Input() type: any;

  @Input() config: any;

  @Input() section: any;

  @Output() action = new EventEmitter<StateAction>();

  @ViewChild(RelationshipListViewComponent, {static: false}) relationshipListViewComponent: RelationshipListViewComponent;
  @ViewChild(RelationshipCardComponent, {static: false}) relationshipCardComponent: RelationshipCardComponent;
  @ViewChild(RelationshipSummaryRibbonViewComponent, {static: false}) relationshipSummaryRibbonViewComponent: RelationshipSummaryRibbonViewComponent;

  public configs: IRelationshipConfig;
  public options: any = {};
  public viewsConfigured: boolean = true;
  public isMini360: boolean = false;

  constructor(
    private csmRelationshipService: CsmRelationshipService,
    private _ds: DescribeService,
    @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) { }

  ngOnInit() {
    this.isMini360 = isMini360(this.ctx);
    this.bootstrapComponent();
    this.view = this.isMini360 ? "LIST" : this.view;
  }

  private bootstrapComponent() {
    this.viewsConfigured = true;
    const { sectionId, layoutId } = (<any>this).section;
    const referenceId: string = `${layoutId}_${sectionId}`;
    forkJoin(
      [
        this.csmRelationshipService.fetchRelationshipsConfigByTypeId(this.type.id, referenceId),
        this._ds.getObjectTree({...MDA_HOST, apiContext:"api/reporting/describe"}, "relationship", 2, null, {skipFilter: true, flpOperationType: "READ"})
      ]
      ).subscribe(([data, tree]) => {
        const keys = ['list', 'card'];
        keys.forEach(key => {
          data[key].forEach(element => {
            const path = fieldInfo2path({leftOperand:element},tree.children);
            const describeField = path[path.length - 1];
            element.meta = describeField && describeField.data && describeField.data.meta;
          });
        })

        if(!isEmpty(data)) {
          this.configs = data;
          this.processConfig();
          this.action.emit({type: "COLUMNS_SET", payload: true});
          this.viewsConfigured = true;
        } else {
          this.viewsConfigured = false;
          this.action.emit({type: "SHOW_LOADER", payload: false});
        }
      });
  }

  private processConfig() {
    const { filters, readOnlyFilter, orderBy } = this.config;
    //Copied addFilters from core and added to core-references. Changed name of util to avoid confusion.
    //Tried using the same form @gs/report but the implementation is different
    const newFilters = ReportFilterUtilsCore.addFilters(cloneDeep(filters), [readOnlyFilter]);
    this.options.list = {
      columns: this.configs.list,
      baseObjectName: Cs360ContextUtils.getRelationshipBaseObjectName(),
      whereClause: newFilters,
      allColumns: uniqWith([...this.configs.list, ...this.configs.card], compareFields)
    }
    this.options.card = {
      columns: this.configs.card,
      baseObjectName: Cs360ContextUtils.getRelationshipBaseObjectName(),
      whereClause: newFilters,
      allColumns: uniqWith([...this.configs.list, ...this.configs.card], compareFields),
      orderBy: orderBy
    }
    this.options.ribbon = {
      attributes: this.configs.ribbon,
      whereClause: newFilters,
      type: this.type
    }
  }

  public updateView(view: string) {
    this.view = view;
    this.processConfig();
  }

  public onAction(evt: any) {
    console.log(evt);
    this.action.emit(evt);
  }

  public getColumnConfig(): any[] {
    return this.view === "LIST" ? this.options.list: this.options.card;
  }

  public updateFiltersAndSort(config: any) {
    this.config = {...this.config, ...config};
    const { filters, readOnlyFilter } = this.config;
    const newFilters = (!!readOnlyFilter && readOnlyFilter.conditions.length) ? ReportFilterUtilsCore.addFilters(cloneDeep(filters), [readOnlyFilter]): filters;
    this.relationshipSummaryRibbonViewComponent.refresh(newFilters);
    if(this.view === "LIST"){
      this.relationshipListViewComponent.refresh(newFilters);
    } else if(this.view === "CARD") {
      this.relationshipCardComponent.refresh({filters: newFilters, orderBy: this.config.orderBy});
    }
  }

}
