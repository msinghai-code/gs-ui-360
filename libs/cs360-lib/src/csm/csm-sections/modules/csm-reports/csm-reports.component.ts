import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {GridType, CompactType, GridsterItem} from 'angular-gridster2';
import { GSEventBusService, GSEvents, StateAction } from "@gs/gdk/core";
import { IntersectionStatus, GRIDSTER_DEFAULTS } from '@gs/gdk/widget-viewer';
import {noop, sortBy, isEmpty} from 'lodash';

import {IReportGroup} from "@gs/report/reports-configuration/report-grouper/report-grouper";
import {MiniPrefix, SectionStateService} from '@gs/cs360-lib/src/common';
import { CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { isMini360 } from '@gs/cs360-lib/src/common/cs360.utils';

@Component({
  selector: 'gs-csm-reports',
  templateUrl: './csm-reports.component.html',
  styleUrls: ['./csm-reports.component.scss']
})
export class CsmReportsComponent implements OnInit {

  public groups: IReportGroup[] = [];
  public options: any;
  public visibilityStatus = {};
  public intersectionStatus = IntersectionStatus;
  public configDetails: any;
  public loader: boolean = false;
  public search = {
    inputValue: null,
    options: [],
    filteredOptions: [],
    onInput: this.onChange.bind(this),
    onOptionChange: this.onOptionChange.bind(this)
  }
  public showGrid: boolean = true;
  public rearrangeGroupModal = {
    isVisible: false,
    handleReset: this.handleReset.bind(this),
    handleCancel: this.handleCancel.bind(this),
    handleOk: this.handleOk.bind(this),
    isOkLoading: false,
    open: this.openRearrangeGroupModel.bind(this)
  }
  public sortedGroup: IReportGroup[];
  public isMini360Variant : boolean = false;

  get no_of_reports(): number {
    return this.groups.reduce((acc: any, cur: any) => {
      return acc + cur.reports.length;
    }, 0);
  }

  @ViewChild('gridstercsm', {static: false}) gridsterCSMRef: any;
  @ViewChild("listitemsort", {static: false}) listItemSortRef : any;

  get sectionLabel(): string {
    return (<any>this).section.label || 'Reports';
  }

  constructor(private sectionStateService: SectionStateService,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
              private eventService: GSEventBusService) { }

  ngOnInit() {
    this.isMini360Variant = isMini360(this.ctx);
    this.bootstrapComponent();
    this.fetchReportConfiguration();
  }

  bootstrapComponent(): void {
    this.options = {
      ...GRIDSTER_DEFAULTS(false),
      gridType: GridType.VerticalFixed,
      resizable: {
        enabled: false
      },
      margin: 16,
      outerMarginLeft: 0,
      outerMarginRight: 0,
      outerMargin: false,
      compactType: CompactType.CompactUpAndLeft,
      fixedRowHeight: 32,
      maxCols: 24,
      minCols: 24,
      minRows: 14,
      minItemCols:8,
      minItemRows:14,
      maxItemRows: 28,
      maxItemCols:24,
      resizeEnabled : false,
      setGridSize : true,
      scrollToNewItems: false,
      useTransformPositioning: true,
      mobileBreakpoint: 200,
      itemResizeCallback : this.onResize.bind(this)
    };
  }

  fetchReportConfiguration(): void {
    window.requestAnimationFrame(() => {
      // Associate state to each group here.
      const { state = {} } = (<any>this).section.state || { state: {} };
      this.groups = (<any>this).section.config.map((group: IReportGroup) => {
        group.state = !!state ? state[group.id] || {}: {};
        // updated the displayOrder by state.
        if(!isEmpty(state) && state[group.id]) {
          const { displayOrder } = state[group.id];
          if(displayOrder !== undefined) {
            group['y'] = displayOrder;
          }
        }
        group['resizeEnabled'] = false;
        return group;
      });
      this.groups = sortBy(this.groups, ['y']);
      if (this.isMini360Variant || isMini360(this.ctx)) {
        this.groupConfigForMini360(this.groups);
      }
      this.search = {
        ...this.search,
        options: this.groups,
        filteredOptions: this.groups
      }
    });
  }

  groupConfigForMini360(groups: Array<IReportGroup>) {
    const indexMap = {
      0: { x: 0, y: 0 },
      1: { x: 1, y: 0 },
      2: { x: 0, y: 1 },
      3: { x: 1, y: 1 },
      4: { x: 0, y: 2 },
      5: { x: 1, y: 2 },
    }
    groups.forEach((group: IReportGroup, grpIdx) => {
      if (group.type == "KPI_GROUP" && group.subGroups) {
        group.subGroups = sortBy(group.subGroups, ['x','y']);
        const numOfSubgrpItems: number = group.subGroups.length;
        group['rows'] = (Math.floor(numOfSubgrpItems % 2) + Math.floor(numOfSubgrpItems / 2)) * 8;
        group.subGroups.forEach((subGroup, subGrpIdx) => {
          subGroup.cols = 1;
          subGroup.rows = 1;
          subGroup.x = indexMap[subGrpIdx].x;
          subGroup.y = indexMap[subGrpIdx].y;
        })
      }
      if (grpIdx != 0) {
        group['y'] = groups[grpIdx - 1]['y'] + groups[grpIdx - 1]['rows'];
      }
    });
  }

  onAction(evt: StateAction): void {
    const { type, payload } = evt;
    const { sectionId, state, layoutId } = (<any>this).section;
    const referenceId: string = `${layoutId}_${sectionId}`;
    switch (type) {
      case "PRESERVE_STATE":
        if(!isEmpty(state.state)) {
          for(let prop in payload) {
            if(!isEmpty(state.state[prop]) && state.state.hasOwnProperty(prop)) {
              state.state[prop] = {
                ...state.state[prop],
                ...payload[prop]
              }
            } else {
              state.state[prop] = payload[prop];
            }
          }
        } else {
          state.state = payload;
        }
        this.sectionStateService
            .saveState({
              referenceId,
              state: state.state,
              moduleName: isMini360(this.ctx)? (MiniPrefix+this.ctx.pageContext).toLowerCase() : this.ctx.pageContext
            })
            .subscribe(noop);
        break;
    }
  }

  onVisibilityChanged(group: IReportGroup, status: IntersectionStatus) {
    window.requestAnimationFrame(() => {
      if (!this.visibilityStatus[group.id] && status === 'Visible') {
        group.isLoaded = true;
        group.properties.layoutId= (<any>this).section && (<any>this).section.layoutId;
        this.visibilityStatus[group.id] = status;
      }
    });
  }

  navigateToReportConfiguration(evt: MouseEvent | TouchEvent) {
    evt.stopPropagation();
    // navigate to configuration screen
  }

  onChange(value: any) {
    this.search.filteredOptions = this.search.options.filter(option => option.name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }

  onOptionChange(group: IReportGroup) {
    const { id } = group;
    try {
      const reportGroupElement: any = this.gridsterCSMRef && this.gridsterCSMRef.el && this.gridsterCSMRef.el.querySelector(`.gs-csm-report-group-${id}`);
      if(reportGroupElement) {
        reportGroupElement.scrollIntoView({ behavior: 'auto' });
      }
    } catch (e) {
      console.warn("Unable to auto scroll");
    }
  }

  onReload() {
    this.showGrid = false;
    this.groups = this.groups.map((g: IReportGroup) => {g.isLoaded = false; return g});
    this.visibilityStatus = {};
    window.requestAnimationFrame(() => this.showGrid = true);
  }

  openRearrangeGroupModel() {
    this.groups = sortBy(this.groups, ['y']);
    this.sortedGroup = [...this.groups];
    this.rearrangeGroupModal = {
      ...this.rearrangeGroupModal,
      isVisible: true
    }
  }

  handleCancel() {
    this.rearrangeGroupModal = {
      ...this.rearrangeGroupModal,
      isVisible: false
    }
  }

  handleOk() {
    this.handleCancel();
    // update the y coordinate of the gridster and refresh the gridster.
    this.showGrid = false;
    this.groups = this.listItemSortRef.sortedItems.map((g: IReportGroup, index) => {
      g['y'] = index;
      g['isLoaded'] = false;
      return g;
    });
    this.visibilityStatus = {};
    window.requestAnimationFrame(() => this.showGrid = true);
    // Preserve state now
    this.onAction({
      type: "PRESERVE_STATE",
      payload: this.groups.reduce((acc: any, curr: IReportGroup) => {
        acc[curr.id] = { displayOrder: curr['y'] };
        return acc;
      }, {})
    })
  }

  handleReset() {
    this.sortedGroup = [...this.groups];
  }

  private onResize(item: GridsterItem){
    const payload = {
      type: GSEvents.GRIDSTERRESIZE,
      sourceId: item.id,
      payload: {}
    };
    this.eventService.emit(payload);
  }

  showLoader(flag: boolean): void {
    this.loader = flag;
  }

}
