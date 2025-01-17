import {
  Component,
  ChangeDetectorRef,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  Inject
} from '@angular/core';
import { Router } from '@angular/router';
import { NzOverlayComponent } from '@gs/ng-horizon/popover';
import { FormControl } from '@angular/forms';
import { isEmpty, isUndefined, merge, keyBy } from "lodash";
import {debounceTime, distinctUntilChanged, filter, map} from "rxjs/operators";
import {LayoutConfigurationService} from "../../../layout-configuration.service";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { StateAction, MessageType } from '@gs/gdk/core';
import {CONTEXT_MENU_INFO, LAYOUT_LISTING_CONSTANTS, PREVIEW_COLUMN_DETAIL} from '../../layout-listing.constants';
import { ManageAssignmentComponent } from '../../manage-assignment/manage-assignment.component';
import {PageContext, PxService, SectionStateService} from '@gs/cs360-lib/src/common';
import { DataTypes } from '@gs/cs360-lib/src/common';
import { GridColumnChooserComponent } from '@gs/cs360-lib/src/common';
import { GridApi, ColumnApi } from '@ag-grid-community/core';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import {NzNotificationService} from "@gs/ng-horizon/notification";
import { NzI18nService} from '@gs/ng-horizon/i18n';
import {NzModalService} from "@gs/ng-horizon/modal";

@Component({
  selector: 'gs-layouts-listing',
  templateUrl: './layouts-listing-grid.component.html',
  styleUrls: ['./layouts-listing-grid.component.scss']
})
export class LayoutsListingGridComponent implements OnInit, OnChanges {
  readonly manageAssignmentTabs = [
    {
      label: this.i18nService.translate('360.admin.layout_listing.manage_assignment'),
      value: 'manageAssignements',
      index: 0,
    },
    {
      label: this.i18nService.translate('360.admin.layout_listing.view_assigned_layout'),
      value: 'viewAssignedLayout',
      index: 1,
    },
  ];

  @Input() config: any;

  @Input() data: any[];

  @Input() manageAssignmentsData: any;

  @Output() action = new EventEmitter<StateAction>();

  @ViewChild("contextMenuGrid", { static:true }) contextMenuGrid: NzOverlayComponent;
  @ViewChild("gridColumnChooser", { static:false }) gridColumnChooser: GridColumnChooserComponent;
  @ViewChild("manageAssignment", { static:false }) manageAssignemnt: ManageAssignmentComponent;

  public layoutSearchControl = new FormControl();

  public loader: boolean;

  public contextMenuInfo: any;

  public showManageAssignmentsModal = false;

  public showFindLayoutTitle = false;

  public selectedHeaderOption;

  public relationshipManagement: any ;

  protected allOptionAdded = false;

  showGrid = true;

  searchInput = new FormControl();

  stateLoading = false;

  manageAssignemntSaving = false;

  changesMade:boolean = true;

  showUpArrow: boolean = false;

  isPartner: boolean = false;

  partnerLayouts = this.i18nService.translate('360.admin.standard_layout.partnerLayouts');

  gridApi: {
    api: GridApi;
    columnApi: ColumnApi;
    [key: string]: any;
  };

  columnState;
  objectLabel: string;

  columnStateApplied = false;

  contextActionEmitted;

  isFeatureFlagEnabled = false;
  isFeatureFlagLoading = false;
  PageContext = PageContext;
  isEndUserPreviewPopupVisible = false;
  isMiniToggleEnabled: boolean = false;
  mini360Enabled: boolean = false;
  drawerTitle: string;
  drawerContent: string;

  constructor(public cdr: ChangeDetectorRef,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              public router: Router,
              @Inject("envService") private env: EnvironmentService,
              protected stateService: SectionStateService,
              public layoutConfigurationService: LayoutConfigurationService,
              public notification: NzNotificationService,
              protected i18nService: NzI18nService,
              public pxService: PxService,
              private modalService: NzModalService) { }

  ngOnInit() {
    this.isPartner = this.router.url.includes('partner') ? true: false;
    this.isFeatureFlagEnabled = this.env.gsObject.featureFlags ? this.env.gsObject.featureFlags['P360'] : false;
    this.isMiniToggleEnabled = this.env.gsObject.featureFlags ? this.env.gsObject.featureFlags['MINI_360'] && this.config && this.config.options && this.config.options.type !== "Pre-built Sections" : false;
    this.searchSubscriber();
    this.getState();
    //this.onChange(Event);
    // this.objectLabel = Cs360ContextUtils.getTranslatedBaseObjectLabel(this.ctx);
    this.objectLabel = this.i18nService.translate(this.ctx.standardLayoutConfig.labelForTranslation);
    this.layoutConfigurationService.getMini360adminEnabled().subscribe((data) => {
      this.mini360Enabled = data.mini360Enabled;
    })  
  }

  protected getState() {
    if(!this.config.options.stateRef) {
      return;
    }
    this.stateLoading = true;
    let referenceId = this.config.options.stateRef;
    if(this.ctx.pageContext === 'R360' && this.config.options.type === this.partnerLayouts) {
      referenceId = 'R360_PARTNER';
    } else if(this.ctx.pageContext === 'C360' && this.config.options.type === this.partnerLayouts) {
      referenceId = 'C360_PARTNER';
    }
    this.stateService.getStateForAdmin(referenceId).subscribe(response => {
      this.stateLoading = false;
      if(!isEmpty(response)) {
        this.columnState = response.state.columnState;
        if(this.columnState) {
          const columnStateMap = keyBy(this.columnState, 'colId');

          const cols = this.config.grid.options.columnDefs.map(col => {
            let sourceObj = columnStateMap[col.field];
            col = merge(col, sourceObj);
            col.enableTooltip = true;
            col.tooltipValueGetter = (params) => {
                if(col && col.field === 'status'){
                    switch (params.data[col.field]) {
                        case 'ASSIGNED':
                            return this.i18nService.translate('360.admin.standard_layout.assigned');
                        case 'DEFAULT':
                            return this.i18nService.translate('360.admin.standard_layout.default');
                        case 'UNASSIGNED':
                            return this.i18nService.translate('360.admin.standard_layout.unassigned');
                        case 'DRAFT':
                            return this.i18nService.translate('360.admin.standard_layout.draft');
                    }
                } else {
                    return params.data[col.field];
                }
            };
            return col;
          });
          this.config.grid.options.columnDefs = cols;
        }
        if(response.state.selectedHeaderOption) {
          this.onClick(response.state.selectedHeaderOption, 'ON_DROPDOWNHEADER_CLICK', true);
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // needed for the grid to occupy width when columns are very few
    if(!isUndefined(this.config.grid.options)) {
      this.config.grid.options = {...this.config.grid.options, autoResizeColumnsToFit: !!this.config.grid.options.autoResizeColumnsToFit};
    }
    if(this.data && this.config.options.actions.dropdownHeader && !this.allOptionAdded) {
      this.allOptionAdded = true;
      this.config.options.actions.headerOptions;
      this.onClick(this.selectedHeaderOption || {label: this.config.options.type, value: "all"}, 'ON_DROPDOWNHEADER_CLICK', true);
    }

    if(changes.config) {
      this.showGrid = false;
      this.columnStateApplied = false;
      this.config.grid.options.columnDefs.forEach(col => {
        if([DataTypes.DATE, DataTypes.DATETIME].includes(col.dataType) && !col.comparator) {
          col.comparator = dateComparator;
        }
      })
      setTimeout(() => {
        this.showGrid = true;
      }, 0);
    }

    if(changes.data && this.contextActionEmitted && this.layoutSearchControl.value) {
      this.contextActionEmitted = false;
      this.action.emit({
        type: 'SEARCH',
        payload: this.layoutSearchControl.value.trim().toLowerCase(),
      });
    }
  }

  onChange(_event:any){
    this.action.emit({
      type: 'SEARCH',
      payload: !!_event.target.value ? _event.target.value.trim().toLowerCase(): "",
    });
  }

  searchSubscriber() {
    this.layoutSearchControl.valueChanges
      .pipe(
        map(searchTerm => (searchTerm && searchTerm.trim().toLowerCase()) || ''),
        filter(searchTerm => searchTerm.length >= 1 || searchTerm.length === 0),
        debounceTime(400),
        distinctUntilChanged(),
      )
      .subscribe((searchTerm) => {
        this.action.emit({
          type: 'SEARCH',
          payload: searchTerm
        });
      });
  }

  columnAction($event: any) {
    if (isEmpty($event.field)) return;
    const { data } = $event;
    switch ($event.field) {
      case 'action_column':
        // Disable action based on layouts.
        if(!isEmpty(data)) {
          this.contextMenuInfo = this.config.options && this.config.options.contextMenuItems ? this.config.options.contextMenuItems : CONTEXT_MENU_INFO(data, this.config.type, this.i18nService);
        } if(this.contextMenuInfo && this.contextMenuInfo.contextMenuItems && this.isPartner) {
          this.contextMenuInfo.contextMenuItems = this.contextMenuInfo.contextMenuItems.filter(item => item.id !== 'assign');
        }
        (<any>this.contextMenuGrid).clickedRowData = $event.data;
        this.contextMenuGrid.open(new ElementRef($event.event.target));
        break;
      case PREVIEW_COLUMN_DETAIL.field:
        if(!isEmpty(data)) {
          this.action.emit({
            type: 'ON_PREVIEW',
            payload: data
          });
        }
        break;
    }
    $event.event.preventDefault();
    $event.event.stopPropagation();
  }

  onColumnsUpdated(updatedColumns, refreshColumnChooser?: boolean) {
    const colMap = keyBy(updatedColumns, 'field');
    const updatedColumnState = this.columnState.map(col => {
      col.hide = colMap[col.colId] && colMap[col.colId].hide;
      return col;
    });
    this.updateState(updatedColumnState);
    if(refreshColumnChooser && this.gridColumnChooser) {
      this.gridColumnChooser.setColumns(updatedColumns);
    }
  }

  onGridReady(event) {
      console.log('- - - - - Grid Ready', event);
      if(['BODY_SCROLLED'].includes(event.type)) {
        return;
      }
      if(event.type === 'COLUMN_RESIZE' || event.type === "COLUMN_MOVED"){
          this.onColumnMoveOrResize(event)
      } else {
          // event.type === 'bodyScroll' ? this.gridApi = event : this.gridApi = event.payload;
          this.gridApi = event.payload
          if(!isEmpty(this.columnState)) {
              setTimeout(() => {
                  this.updateRowGroupStatusInColumnState();
                  this.setColumnState();
              });
          } else {
              this.columnState = this.gridApi.columnApi.getColumnState();
              this.updateRowGroupStatusInColumnState();
              this.columnStateApplied = true;
          }
          this.updateGridLoader();
      }
  }

  protected updateGridLoader() {
    if(!this.gridApi) {
      return;
    }
    // this.stateLoading = true;
      // console.log('api', this.gridApi)
    if(this.loader) {
        // this.stateLoading = true;
        // this.gridApi.api && this.gridApi.api.showLoadingOverlay();
    } else {
        // this.stateLoading = false;
        // this.gridApi.api && this.gridApi.api.hideOverlay();
    }
  }

  protected updateRowGroupStatusInColumnState() {
    const groupedColumn = this.config.grid.options.columnDefs.find(col => col.rowGroup);

    // Setting row group to false in all columns of state when no groupedColumn is present
    this.columnState.forEach(col => {
      col.rowGroup = false;
      col.rowGroupIndex = null;
    });

    if(groupedColumn) {
      const columnState = this.columnState.find(colState => colState.colId === groupedColumn.field);
      if(columnState) {
        columnState.rowGroupIndex = 0;
      }
    } else {
        // When grouped column is not present in state, add it. See below for a case when it is not available.
        // Case:  Previously we used to have relationshipTypeName as grouped column so some users might have the same in their state.
        //        Now we changed it to relationshipTypeId which might not be present in some user's state, so adding that to state in that case.
        this.columnState.push({
            colId: groupedColumn && groupedColumn.colId || groupedColumn && groupedColumn.field,
            rowGroup: true,
            rowGroupIndex: 0,
        })
    }
  }

  protected setColumnState() {
    const success = this.gridApi && this.gridApi.columnApi && this.gridApi.columnApi.applyColumnState({state: this.columnState,
          applyOrder: true});
    if(!success) {
        this.gridApi && this.gridApi.columnApi && this.gridApi.columnApi.applyColumnState({state: this.columnState,
            applyOrder: true});
    }
    this.columnStateApplied = true;
  }

  onColumnMoveOrResize(event) {
    // console.log(': : : move/resize', event);
    if(event && (event.type === "COLUMN_MOVED" || event.type === "COLUMN_RESIZED")) {
      this.columnState = event.payload && event.payload.colsState;
      this.updateState(this.columnState);
    }
  }

  updateState(columnState?) {
    // console.log(' > > > > > > > > > > > UPDATING STATE');
    if(columnState) {
      this.columnState = columnState;
      this.setColumnState();
    } else {
      this.columnState = this.gridApi.columnApi.getColumnState();
    }
    // this.gridApi.api.sizeColumnsToFit();
    let referenceId = this.config.options.stateRef;
    if(this.ctx.pageContext === 'R360' && this.config.options.type === this.partnerLayouts) {
      referenceId = 'R360_PARTNER';
    } else if(this.ctx.pageContext === 'C360' && this.config.options.type === this.partnerLayouts) {
      referenceId = 'C360_PARTNER';
    }
    this.stateService.saveState({
      referenceId,
      state: {
        columnState: columnState || this.columnState,
        selectedHeaderOption: this.selectedHeaderOption,
      },
      moduleName: this.ctx.pageContext + "_admin"
    }).subscribe();
  }

  onContextMenuAction(evt: any, label: string) {
    this.contextActionEmitted = true;
    this.action.emit({
      type: label,
      payload: (<any>this.contextMenuGrid).clickedRowData
    });
  }

  onAdd() {
    this.showLoader(true);
    this.action.emit({
      type: 'ON_ADD',
      payload: null
    });
      this.showLoader(false);
  }

  onVisibilityChange(changeValue){
    this.showUpArrow = changeValue;
  }

  onmanageAssignmentModalCancel() {
    this.showFindLayoutTitle = false;
    this.showManageAssignmentsModal = false;
  }

  onManageAssignmentsTitleChange() {
    this.showFindLayoutTitle = !this.showFindLayoutTitle;
    this.manageAssignemnt.toggleView();
  }

  onRowChange(event) {
    this.changesMade = event;
  }

  onClick(option: any, type, ignoreStateUpdate = false) {
    this.selectedHeaderOption = option;
    this.relationshipManagement=this.selectedHeaderOption;
    this.action.emit({
      type,
      payload: option
    });
    if(!ignoreStateUpdate) {
      this.updateState();
    }
  }

  showLoader(flag: boolean): void {
    this.loader = flag;
    this.updateGridLoader();
    this.cdr.detectChanges();
  }

  onManageAssignmentModalSave(){
    this.manageAssignemntSaving = true;
    this.manageAssignemnt.save().subscribe(res => {
      this.manageAssignemntSaving = false;
      this.showManageAssignmentsModal = false;
      this.notification.create('success','', this.i18nService.translate(LAYOUT_LISTING_CONSTANTS.LAYOUT_REORDER_SUCCESS), [],{nzDuration:5000})
    })
  }

  openEndUserPreviewPopup($event) {
    this.isEndUserPreviewPopupVisible = $event;
    this.isFeatureFlagLoading = true;

    if ($event) {
      this.modalService.info({
        nzTitle: this.i18nService.translate('360.csm.p360.feature_toggle.pop_title'),
        nzContent: this.i18nService.translate('360.csm.p360.feature_toggle.pop_subtitle'),
        nzOkText: this.i18nService.translate('360.csm.p360.feature_toggle.pop_ok'),
        nzCancelText: this.i18nService.translate('360.csm.p360.feature_toggle.cancel'),
        nzOnOk: () => this.toggleEndUserPreview(true),
        nzOnCancel: () => this.cancelEndUserPreviewPopup(),
        nzMaskClosable: false,
        nzVisible: this.isEndUserPreviewPopupVisible,
        nzWrapClassName: 'enduser_popup'
      });
    } else {
      this.layoutConfigurationService.updateP360PreviewFeatureFlag(this.ctx.pageContext,false).subscribe((data) => {
        this.isFeatureFlagEnabled = !data.result;
        this.isFeatureFlagLoading = false;

        if (data.result) {
          this.notification.success(this.i18nService.translate('360.csm.p360.feature_toggle.cancel_success'));
        } else {
          this.notification.error(this.i18nService.translate('360.csm.p360.feature_toggle.cancel_failed'));
        }
      });
    }
  }

  openMini360EndUserPreviewPopup($event) {
      if(!$event) {
          this.pxService.pxAptrinsicIdentify('mini_360_enabled',false);
      }
    this.isEndUserPreviewPopupVisible = $event;
    this.isFeatureFlagLoading = true;
    const isTurningOn = $event;
    const isRelationshipEnabled = window.GS.isRelationshipEnabled;
    if($event) {
      this.drawerTitle = isRelationshipEnabled ? this.i18nService.translate('360.csm.mini_360.cr360_feature_toggle') : this.i18nService.translate('360.csm.mini_360.c360_feature_toggle');
      this.drawerContent = isRelationshipEnabled ? this.i18nService.translate('360.csm.mini_360.cr360_on_label') : this.i18nService.translate('360.csm.mini_360.c360_on_label');
    } else {
      this.drawerTitle = isRelationshipEnabled ? this.i18nService.translate('360.csm.mini_360.mini_cr360_success') : this.i18nService.translate('360.csm.mini_360.mini_c360_off_feature_toggle');
      this.drawerContent = isRelationshipEnabled ? this.i18nService.translate('360.csm.mini_360.mini_cr360_turn_off') : this.i18nService.translate('360.csm.mini_360.mini_c360_turn_off');
    }
    const mini360EnabledMessage = isTurningOn
        ? this.i18nService.translate('360.csm.mini_360.mini360_success')
        : this.i18nService.translate('360.csm.mini_360.mini360_turn_off_success');
    this.modalService.info({
      nzTitle:  this.drawerTitle,
      nzContent: this.drawerContent,
      nzOkText: 'Proceed',
      nzCancelText: this.i18nService.translate('360.csm.p360.feature_toggle.cancel'),
      nzOnOk: () => this.onModalOk(isTurningOn, mini360EnabledMessage),
      nzOnCancel: () => this.onModalCancel(),
      nzMaskClosable: false,
      nzVisible: this.isEndUserPreviewPopupVisible,
      nzWrapClassName: 'enduser_popup'
    });
  }

  onModalOk($event, message){
    this.pxService.pxAptrinsicIdentify('mini_360_enabled',true)
    this.updateMini360adminFlag($event, message);
  }

  onModalCancel(){
    this.mini360Enabled = !this.mini360Enabled ? true: false;
    this.isFeatureFlagLoading = false;

  }

  updateMini360adminFlag(event, message){
    const payload = {mini360Enabled: event};
    this.layoutConfigurationService.updateMini360adminEnabled(payload).subscribe((data) => {
      if (data.result) {
        sessionStorage.removeItem('global360Props');
        this.isFeatureFlagLoading = false;
        this.mini360Enabled = event;
        this.notification.success(message);
      } else {
        this.notification.error("MINI 360 Failed");
        this.isFeatureFlagLoading = false;
        this.mini360Enabled = !event;
      }
    })
  }

  cancelEndUserPreviewPopup() {
    this.isEndUserPreviewPopupVisible = false;
    this.isFeatureFlagEnabled = false;
    this.isFeatureFlagLoading = false;
  }

  toggleEndUserPreview(event: boolean) {
    this.isEndUserPreviewPopupVisible = false;

    if (event && this.isFeatureFlagEnabled) {
      this.layoutConfigurationService.updateP360PreviewFeatureFlag(this.ctx.pageContext,true).subscribe((data) => {
        this.isFeatureFlagEnabled = data.result;
        this.isFeatureFlagLoading = false;

        if (data.result) {
          this.notification.success(this.i18nService.translate('360.csm.p360.feature_toggle.success'));
        } else {
          this.notification.error(this.i18nService.translate('360.csm.p360.feature_toggle.failed'));
        }
      });
    }
  }


}

function dateComparator(date1, date2) {
  var date1Number = date1 && new Date(date1).getTime();
  var date2Number = date2 && new Date(date2).getTime();

  if (date1Number == null && date2Number == null) {
    return 0;
  }

  if (date1Number == null) {
    return -1;
  } else if (date2Number == null) {
    return 1;
  }

  return date1Number - date2Number;
}
