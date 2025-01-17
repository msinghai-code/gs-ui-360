import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { NzFormatEmitEvent, NzTreeNodeOptions } from '@gs/ng-horizon/core';
import { isEmpty } from 'lodash';
import {RelationshipConfigurationService} from "../relationship-configuration.service";
import {compareFields} from "@gs/gdk/utils/field";
import {ReportUtils} from "@gs/report/utils";
import { StateAction } from '@gs/gdk/core';
import {DEFAULT_SOURCEDETAILS_FOR_RELATIONSHIP} from "./../relationship-configuration.constants";
import {FormControl} from "@angular/forms";
import {debounceTime, distinctUntilChanged, filter, map} from "rxjs/operators";

@Component({
  selector: 'gs-relationship-reports-configuration',
  templateUrl: './relationship-reports-configuration.component.html',
  styleUrls: ['./relationship-reports-configuration.component.scss']
})
export class RelationshipReportsConfigurationComponent implements OnInit {

  @Input() config: any;
  @Output() action = new EventEmitter<StateAction>();

  public searchValue: string;
  public availableReports: any[];
  public filteredReports: any[];
  public reportloading: boolean = false;
  public fieldSelectorOptions = {
    host: ReportUtils.getFieldTreeHostInfo(DEFAULT_SOURCEDETAILS_FOR_RELATIONSHIP),
    objectName: DEFAULT_SOURCEDETAILS_FOR_RELATIONSHIP.objectName
  }
  public searchControl = new FormControl();

  get checkedReports(): string[] {
    if(isEmpty(this.config.reports)) {
      return [];
    }
    return this.config.reports.map(r => r.id);
  }

  constructor(private relationshipConfigurationService: RelationshipConfigurationService) { }

  ngOnInit() {
    this.searchSubscriber();
    this.fetchAvailableReports();
  }

  searchSubscriber() {
    this.searchControl.valueChanges
        .pipe(
            map(searchTerm => searchTerm.trim().toLowerCase()),
            filter(searchTerm => searchTerm.length >= 1 || searchTerm.length === 0),
            debounceTime(400),
            distinctUntilChanged(),
        )
        .subscribe((searchTerm) => {
          this.filteredReports = this.availableReports.filter(s => s.title.toLowerCase().includes(searchTerm));
        });
  }

  fetchAvailableReports() {
    this.relationshipConfigurationService.fetchReports()
        .subscribe((reports) => {
          this.filteredReports = this.availableReports = reports;
          this.reportloading = true;
        });
  }

  nzEvent(event: NzFormatEmitEvent): void {
    const { eventName, checkedKeys, node } = event;
    switch (eventName) {
      case 'check':
        const { reportId = '', name = '' } = (node.origin && node.origin.meta) ? node.origin.meta: {};
        if(node.isChecked) {
          if(!!this.config.reports) {
            this.config.reports.push({id: reportId, name});
          } else {
            this.config.reports = [{id: reportId, name}];
          }
        } else {
          const index = this.config.reports.findIndex((r) => r.id === reportId);
          if (index > -1) {
            this.config.reports.splice(index, 1); // 2nd parameter means remove one item only
          }
        }
        this.action.emit({
          type: 'REPORT_TOGGLE',
          payload: null
        });
        break;
      case 'click':
        /**
         * On node click, check the node
         */
        break;
      default: null;
    }
  }

  onAction(evt: StateAction) {
    const { type, payload } = evt;
    switch (type) {
      case 'FIELD_SELECTED':
        if(!!this.config && !compareFields(payload, this.config.filter)) {
          this.action.emit(evt);
        }
        this.config = {
          ...this.config,
          filter: payload
        };
        break;
      default: null
    }
  }

  serialize(): any {
    return this.config;
  }

  validate(): boolean {
    return true;
  }

}
