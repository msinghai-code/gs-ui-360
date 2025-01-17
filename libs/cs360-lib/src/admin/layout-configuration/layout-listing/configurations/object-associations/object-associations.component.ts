import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { LayoutsListingGridComponent } from '../../shared/layouts-listing-grid/layouts-listing-grid.component';
import { SubSink } from 'subsink';
import { LayoutConfigurationService } from '../../../layout-configuration.service';
import {
    AGGridColumn,
    AGGridConfig,
    formatColumnDefinitionsForGrid,
    AGGridEditMode
} from "@gs/gdk/grid";
import { StateAction } from '@gs/gdk/core';
import {HybridHelper} from "@gs/gdk/utils/hybrid";
import { ACTION_COLUMN_DETAIL, CONTEXT_MENU_LABELS, LAYOUT_LISTING_CONTEXT } from '../../layout-listing.constants';
import { cloneDeep } from 'lodash';
import { AssociationConditionsComponent } from './association-conditions/association-conditions.component';
import { OBJECT_ASSOCIATIONS_MESSAGES } from '@gs/cs360-lib/src/common';
import { NzModalService } from '@gs/ng-horizon/modal';
import { NzI18nService} from '@gs/ng-horizon/i18n';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { CS360Service } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-object-associations',
  templateUrl: './object-associations.component.html',
  styleUrls: ['./object-associations.component.scss']
})
export class ObjectAssociationsComponent implements OnInit {

  @ViewChild("gsObjectAssociationslisting", { static:true }) gsObjectAssociationslisting: LayoutsListingGridComponent;

  public config;

  public filteredData: any[];
  public data: any[];
  public showAddAssoc = false;
  public selectedAssocInfo;
    //{360.admin.object_association.multipleAssociation}=Multiple Associations
  public OBJECT_ASSOCIATIONS_GRID_COLUMN_DEF = [
    {
      field: 'objectLabel',
      headerName: this.i18nService.translate('360.admin.object_assocaition.objectName'),
      minWidth: 300,
      dataType: 'string',
      disabled: true,
      cellRenderer: (params) => {        
        if(!params.data) {
          return;
        }
        if(params.node.parent.allChildrenCount > 1 && params.node.firstChild) {
            const multipleAssociation = this.i18nService.translate('360.admin.object_association.multipleAssociation')
          return `<div class="object-multiple-associations"><span class="object-name">${params.data.objectLabel}</span><span class="multiple-info">(`+multipleAssociation+`)</span></div>`
        } else {
          return params.data.objectLabel;
        }
      },
      rowSpan: (params) => {
        if(!params.data) {
          return 1;
        }
        return params.node.firstChild ? params.node.parent.allChildrenCount : 1;
      },
      sortable: true,
      rowGroup: true,
      showRowGroup: true
    },
    {
      field: 'rtLabels',
      headerName: this.i18nService.translate('360.admin.object_assocaition.mapped_rel_types'),
      minWidth: 300,
      cellRenderer: (params) => {
        if(params.data.relationshipTypeIds && params.data.relationshipTypeIds.includes("ALL_CURRENT_AND_FUTURE_TYPES")) {
          return this.i18nService.translate("360.csm.relationship_filter.all");
        }
        if(!params.data.rtLabels) {
          return;
        }
        if(params.data.rtLabels.length > 2) {
          return params.data.rtLabels.slice(0, 2).join(",") + `<span class="rtLabels-more">` + (params.data.rtLabels.length - 2) + " more" + `</span>`;
        } else {
          return params.data.rtLabels.join(",");
        }
      },
      dataType: 'string',
      sortable: false,
      disabled: true
    },
    {
      field: 'config',
      headerName: this.i18nService.translate('360.admin.object_assocaition.mapped_config'),
      minWidth: 600,
      dataType: 'string',
      cellRenderer: AssociationConditionsComponent,
      disabled: true
    },
    {
      field: 'createdBy',
      headerName: this.i18nService.translate('360.admin.object_assocaition.created_by'),
      minWidth: 200,
      dataType: 'string',
      sortable: false,
      hide: true
    },
    {
      field: 'createdDate',
      headerName: this.i18nService.translate('360.admin.object_assocaition.created_on'),
      dataType: 'datetime',
      sortable: false,
      hide: true
    },
    {
      field: 'modifiedDate',
      sortable: false,
      headerName: this.i18nService.translate('360.admin.object_assocaition.modified_date'),
      dataType: 'datetime',
      sort: 'desc',
      hide: true
    },
    {
      field: 'modifiedBy',
      sortable: false,
      headerName: this.i18nService.translate('360.admin.object_assocaition.modified_by'),
      dataType: 'string',
      hide: true
    }
  ];

  isShow:boolean=true;
  hideElement(){
    this.isShow=false;
  }
  private subs = new SubSink();
  private selectedHeaderOption;

  constructor(public layoutConfigurationService: LayoutConfigurationService,
              @Inject("envService") private _env: EnvironmentService,
              private modalService: NzModalService,
              private c360Service: CS360Service,private i18nService: NzI18nService) { }

  ngOnInit() {
    if(!this.config) {
      // Get Grid meta data.
      this.config = this.createConfig();
      // Get Associations
      this.fetchAssociations();
    }
  }

  private getHeaderOptions() {
    let options = [];
    if(this._env.moduleConfig.relationshipTypes) {
      options = this._env.moduleConfig.relationshipTypes.map(t => {return {...t, label: t.Name}});
        options.unshift({label:this.i18nService.translate('360.admin.object_assocaition.all_types'), Gsid:"ALL_CURRENT_AND_FUTURE_TYPES"})
    }

    // options.push({label: "All Associations(" + this.filteredData.length + ")", Gsid: "all"});
    return options;
  }

  createConfig(): any {
    const columnDefs: AGGridColumn[] = formatColumnDefinitionsForGrid({
      columns: this.OBJECT_ASSOCIATIONS_GRID_COLUMN_DEF,
      pinnedColumns: [{columnName: 'action_column', pinnedPosition: "right"}],
      actionColumns: [ACTION_COLUMN_DETAIL],
      additionalProps: {
        lockPinned: true
      }
    });
    columnDefs.map(col => {
      if (col.field === 'config') {
        col.enableTooltip = false;
      }
      else {
        col.enableTooltip = true;
        col.tooltipValueGetter = (params) => {
          if( params.column && params.column.colId && params.column.colId.includes("rtLabels") && params.data.relationshipTypeIds && params.data.relationshipTypeIds.includes("ALL_CURRENT_AND_FUTURE_TYPES")) 
            return this.i18nService.translate("360.csm.relationship_filter.all");
          else
          return params.data[col.field];
        }   
       }
      
    });
    const objectLabelColumnDef = columnDefs.find(x => x.field === "objectLabel");
    objectLabelColumnDef.cellClassRules = {'cell-span': params => {return 'cell-span'}};
    
    return {
      type: LAYOUT_LISTING_CONTEXT.COMMON,
      options: {
        type: this.i18nService.translate('360.admin.object_assocaition.add_association_type'),
        contextMenuItems: this.getContextMenuItems(),
        actions: {
          buttonText: this.i18nService.translate('360.admin.object_assocaition.add_association_btn'),
          showColumnChooser: true,
          dropdownHeader: true,
          headerOptions: this.getHeaderOptions(),
          dropdownHelpText: this.i18nService.translate('360.admin.object_assocaition.add_association_dropdowntext')
        }
      },
      grid: {
        options: {
          suppressRowTransform: true,
          autoResizeColumnsToFit: true,
          columnDefs: columnDefs,
          defaultColDef: {
            sortable: false,
            filter: false,
          },
          noRowsOverlayComponentParams: {
            title:this.i18nService.translate('360.admin.object_assocaition.no_association_title') ,
            message: this.i18nService.translate('360.admin.object_assocaition.no_association_message')
          },
          getRowClass: (params) => {
            if(!params.data) {
              return;
            }
            if(params.data.source === "SFDC" && !HybridHelper.isSFDCHybridHost()) {
              return 'disable-click';
            }
          },
          // groupUseEntireRow: true,
          groupDisplayType: 'groupRows',
          groupDefaultExpanded: 1,
          groupHideOpenParents: true,
          getRowNodeId: (data): string => data.associationId
        } as AGGridConfig,
        mode: AGGridEditMode.NONE,
        additionalOptions: {}
      }
    }
  }

  private getContextMenuItems() {
    return { contextMenuItems: [
      {
        id: "edit",
        icon: null,
        label: CONTEXT_MENU_LABELS.VIEW_EDIT,
        disabled: false,
      },
      {
        id: "delete",
        icon: null,
        label: CONTEXT_MENU_LABELS.DELETE_LAYOUT,
        disabled: false
      }
    ]};
  }

  fetchAssociations() {
    this.layoutConfigurationService.invalidateCache();
    this.layoutConfigurationService.fetchAssociations().subscribe(data => {
      this.data = data;
      if(this.selectedHeaderOption) {
        this.filteredData = this.data.filter(x => x.relationshipTypeIds.includes(this.selectedHeaderOption));
      } else {
        this.filteredData = cloneDeep(this.data);
      }
    })
  }

  onSearch(searchTerm: string) {
    // Do client side filtering.
    this.filteredData = this.data.filter(s => s.objectLabel.toLowerCase().includes(searchTerm));
  }

  openDeleteConfigModal(payload: any): void {
    this.modalService.confirm({
      nzTitle: this.i18nService.translate('360.admin.object_assocaition.delete_association_title') ,
      nzContent:   this.i18nService.translate('360.admin.object_assocaition.delete_association_message1') +' '+ payload.objectLabel +' '+ this.i18nService.translate('360.admin.object_assocaition.delete_association_message2'),
      nzOnOk: () => {
        this.deleteConfig(payload.associationId);
      },
      nzOkText: this.i18nService.translate('360.admin.object_assocaition.deletetext'),
    });
  }

  private deleteConfig(associationId: string) {
    this.layoutConfigurationService.deleteAssociation(associationId).subscribe(response => {
      if(response.result) {
        this.fetchAssociations();
        // this.toastMessageService.add(OBJECT_ASSOCIATIONS_MESSAGES.DELETE_SUCCESS, MessageType.SUCCESS, null, {
        //   duration: 5000,
        // });
        this.c360Service.createNotification('success', this.i18nService.translate(OBJECT_ASSOCIATIONS_MESSAGES.DELETE_SUCCESS), 5000);
      }
    })
  }

  onAction(evt: StateAction) {
    const { type, payload } = evt;
    switch(type) {
      case "ON_DROPDOWNHEADER_CLICK":
        if(payload.value !== "all") {
          this.filteredData = this.data.filter(x => x.relationshipTypeIds.includes(payload.Gsid));
          this.selectedHeaderOption = payload.Gsid;
        } else {
          this.filteredData = cloneDeep(this.data);
        }
        break;
      case CONTEXT_MENU_LABELS.DELETE_LAYOUT: 
        if(payload.source === "SFDC" && !HybridHelper.isSFDCHybridHost()) {
          // this.toastMessageService.add("SFDC associations cannot be edited from NXT", MessageType.ERROR, null, {
          //   duration: 5000,
          // });
          this.c360Service.createNotification('error', this.i18nService.translate('360.admin.object_assocaition.sfdc_edit_message'), 5000)
          return;
        }
        this.openDeleteConfigModal(payload);
        break;
      case CONTEXT_MENU_LABELS.VIEW_EDIT:
        if(payload.source === "SFDC" && !HybridHelper.isSFDCHybridHost()) {
          // this.toastMessageService.add("SFDC associations cannot be edited from NXT", MessageType.ERROR, null, {
          //   duration: 5000,
          // });
          this.c360Service.createNotification('error', this.i18nService.translate('360.admin.object_assocaition.sfdc_edit_message'), 5000)
          return;
        }
        this.selectedAssocInfo = cloneDeep(payload);
        this.showAddAssoc = true;
        break;
      case "SEARCH":
        this.onSearch(payload);
        break;   
      case "ON_ADD":
        this.selectedAssocInfo = null;
        this.showAddAssoc = true;
        break;
    }
  }

  onAddAssocAction(isSave: boolean) {
    this.showAddAssoc = false;
    if(isSave) {
      this.fetchAssociations();
    }
  }

}
