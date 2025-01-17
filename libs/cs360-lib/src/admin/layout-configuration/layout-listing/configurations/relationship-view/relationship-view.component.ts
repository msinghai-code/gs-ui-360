import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CellClickedEvent } from "@ag-grid-community/core";
import { isEmpty} from "lodash";
import {SubSink} from 'subsink';
import { NzModalService } from '@gs/ng-horizon/modal';
import {
  formatColumnDefinitionsForGrid,
  AGGridEditMode
} from "@gs/gdk/grid";
import { ListCellRendererComponent } from "@gs/gdk/grid";
import { MessageType } from '@gs/gdk/core';
import {ACTION_COLUMN_DETAIL, CONTEXT_MENU_LABELS} from "../../layout-listing.constants";
import {debounceTime, distinctUntilChanged, filter, map, take} from "rxjs/operators";
import {ConfigurationsService} from "../configurations.service";

import { APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';
import {RelationshipSectionConfigurationService} from "../../../relationship-layout-configuration/relationship-layout-configuration.service";

import { GridApi, ColumnApi } from '@ag-grid-community/core';
import { CS360Service } from '@gs/cs360-lib/src/common';
import { NzOverlayComponent } from '@gs/ng-horizon/popover';
import { NzI18nService } from '@gs/ng-horizon/i18n';

@Component({
  selector: 'gs-relationship-view',
  templateUrl: './relationship-view.component.html',
  styleUrls: ['./relationship-view.component.scss']
})
export class RelationshipViewComponent implements OnInit {

  @ViewChild("contextMenuGrid", { static:true }) contextMenuGrid: NzOverlayComponent;

  public contextMenuInfo: any;
  columnState;
  gridApi: {
    api: GridApi;
    columnApi: ColumnApi;
    [key: string]: any;
  };
  public searchControl = new FormControl();
  public loader: boolean;
  public navigating = false;
  //{360.admin.relationship_view.name}='Name'
  //{360.admin.relationship_view.relationship_type}='Applied to Relationship Types'
  //{360.admin.relationship_view.created_by}='Created By'
  //{360.admin.relationship_view.created_on}='Created On'
  //{360.admin.relationship_view.last_modified_date}='Last Modified Date'
  //{360.admin.relationship_view.last_modified_by}='Last Modified By'
  public RELATIONSHIP_CONFIG_GRID_COLUMN_DEF = [
    {
      field: 'name',
      headerName:this.i18nService.translate('360.admin.relationship_view.name'),
      minWidth: 300,
      width: 250,
      dataType: 'string',
      sortable: true,
      disabled:true
    },
    {
      field: 'relationshipTypes',
      headerName: this.i18nService.translate('360.admin.relationship_view.relationship_type'),
      minWidth: 500,
      dataType: 'string',
      disabled:true,
      cellRendererFramework: ListCellRendererComponent
    },
    {
      field: 'createdBy',
      headerName: this.i18nService.translate('360.admin.relationship_view.created_by'),
      minWidth: 200,
      dataType: 'string',
      sortable: true,
      hide:true
    },
    {
      field: 'createdDate',
      headerName: this.i18nService.translate('360.admin.relationship_view.created_on'),
      minWidth: 200,
      dataType: 'string',
      sortable: true,
      hide:true
    },
    {
      field: 'modifiedDate',
      sortable: true,
      headerName: this.i18nService.translate('360.admin.relationship_view.last_modified_date'),
      minWidth: 200,
      dataType: 'string',
      sort: 'desc',
      hide:true
    },
    {
      field: 'modifiedBy',
      sortable: true,
      headerName: this.i18nService.translate('360.admin.relationship_view.last_modified_by'),
      minWidth: 200,
      dataType: 'string',
      hide:true
    }
  ];
  public gridOptions = {
    options: {
      columnDefs: formatColumnDefinitionsForGrid({
                                                   columns: this.RELATIONSHIP_CONFIG_GRID_COLUMN_DEF,
                                                   pinnedColumns: [{columnName: 'action_column', pinnedPosition: "right"}],
                                                   actionColumns: [ACTION_COLUMN_DETAIL],
                                                   additionalProps: {
                                                       lockPinned: true
                                                   }
                                                 }),
      defaultColDef: {
        sortable: false,
        filter: false,
      },
      accentedSort: true,
      //{360.admin.relationship_view.no_relationship_title}='No Relationship Section Config found'
      //{360.admin.relationship_view.no_relationship_message}='Try adjusting your search.'
      noRowsOverlayComponentParams: {
        title: this.i18nService.translate('360.admin.relationship_view.no_relationship_title'),
        message: this.i18nService.translate('360.admin.relationship_view.no_relationship_message')
      },
      onCellClicked: (event: CellClickedEvent) => {
        if(event.colDef.field === 'name') {
          this.navigating = true;
          this.router.navigate([APPLICATION_ROUTES.RELATIONSHIP_CONFIGURE(event.data.viewId || 'new')]);
        }
      },
      getRowNodeId: (data): string => data.viewId
    },
    mode: AGGridEditMode.NONE,
    additionalOptions: {}
  }
  public data: any[];
  private originalData: any[];
  private subs = new SubSink();

  set _data(data) {
    this.originalData = data;
  }

  get _data() {
    return this.originalData;
  }

  constructor(private configurationsService: ConfigurationsService,
              private c360Service: CS360Service,
              private relationshipSectionConfigurationService: RelationshipSectionConfigurationService,
              private router: Router,
              private modalService: NzModalService,
              private i18nService: NzI18nService) { }

  ngOnInit() {
    this.searchSubscriber();
    this.fetchRelationshipSectionConfigList();
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
          this.data = this._data.filter(s => s.name.toLowerCase().includes(searchTerm));
        });
  }

  fetchRelationshipSectionConfigList() {
    this.subs.add(
      this.configurationsService
          .fetchRelationshipSectionConfigList()
          .pipe(take(1))
          .subscribe((list) => {
            if(!isEmpty(list) && list.length) {
              this.data = this._data = list;
            } else {
              this.data = [];
            }
          })
    );
  }

  onChange(_event:any){
    const searchTerm = !!_event.target.value ? _event.target.value.trim().toLowerCase(): "";
    this.data = this._data.filter(s => s.name.toLowerCase().includes(searchTerm));
  }

  onAdd() {
    this.navigating = true;
    this.router.navigate([APPLICATION_ROUTES.RELATIONSHIP_ASSIGN('new')], {queryParams: {mode: "create"}});
  }

  columnAction($event: any) {
    if (isEmpty($event.field)) return;
    switch ($event.field) {
      case 'action_column':
        // Disable action based on layouts.
        const { data } = $event;
        if(!isEmpty(data)) {
          this.contextMenuInfo = {contextMenuItems: [
            {
              id: "edit",
              icon: null,
              label: this.i18nService.translate('360.admin.layout_listing_constants.VIEW_EDIT'),
              disabled: false
            }
          ]};
          if(!data.default) {
             //{360.admin.relationship_view.default_layout_tooltip}='Default Layout cannot be assigned.'
            this.contextMenuInfo.contextMenuItems.push({
              id: "delete",
              icon: null,
              label: this.i18nService.translate('360.admin.layout_listing_constants.DELETE_LAYOUT'),
              disabled: false,
              tooltip: this.i18nService.translate('360.admin.relationship_view.default_layout_tooltip'),
            });
          }
        }
        (<any>this.contextMenuGrid).clickedRowData = $event.data;
        this.contextMenuGrid.open(new ElementRef($event.event.target));
        break;
    }
    $event.event.preventDefault();
    $event.event.stopPropagation();
  }

  onContextMenuAction(evt: any, menuItems) {
    const { label } = menuItems;
    const { viewId } = (<any>this.contextMenuGrid).clickedRowData;
    switch (label) {
      case this.i18nService.translate('360.admin.layout_listing_constants.VIEW_EDIT'):
        this.navigating = true;
        this.router.navigate([APPLICATION_ROUTES.RELATIONSHIP_CONFIGURE(viewId || 'new')]);
        break;
      case  this.i18nService.translate('360.admin.layout_listing_constants.DUPLICATE'):
        break;
      case this.i18nService.translate('360.admin.layout_listing_constants.DELETE_LAYOUT'):
        this.openDeleteConfigModal(viewId);
        break;
    }
  }

  openDeleteConfigModal(viewId: string): void {
     //{360.admin.relationship_view.delete_rel_title}='Delete Relationship Config'
      //{360.admin.relationship_view.delete_rel_content}='This will permanently delete this config. Are you sure you want to delete?'
    this.modalService.confirm({
      nzTitle: this.i18nService.translate('360.admin.relationship_view.delete_rel_title'),
      nzContent: this.i18nService.translate('360.admin.relationship_view.delete_rel_content'),
      nzOnOk: () => {
        this.deleteConfig(viewId);
      },
      nzOkText: this.i18nService.translate('360.admin.common_layout.deleteModalOk')
    });
  }

  deleteConfig(viewId: string): void {
    this.loader = true;
    this.relationshipSectionConfigurationService.deleteRelationshipConfig(viewId)
        .subscribe((data) => {
          this.loader = false;
          if(data) {
            this.fetchRelationshipSectionConfigList();
             //{360.admin.relationship_view.delete_rel_message_success}='Relationship Config deleted successfully.'
            this.openToastMessageBar({message: this.i18nService.translate('360.admin.relationship_view.delete_rel_message_success'), action: null, messageType: MessageType.SUCCESS});
          } else {
            //{360.admin.relationship_view.delete_rel_message_fail}='Unable to delete Relationship Config.'
            this.openToastMessageBar({message:  this.i18nService.translate('360.admin.relationship_view.delete_rel_message_fail'), action: null, messageType: MessageType.ERROR});
          }
        });
  }

  private openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.c360Service.createNotification(messageType, message, 5000);
    }
  }



  onColumnsUpdated(updatedColumns) {
    this.gridOptions.options.columnDefs = updatedColumns;
    setTimeout(() => {
      this.gridApi.api.sizeColumnsToFit();
    }, 0);
   
  }


  onGridReady(event) {
    this.gridApi = event.payload;
  }
}
