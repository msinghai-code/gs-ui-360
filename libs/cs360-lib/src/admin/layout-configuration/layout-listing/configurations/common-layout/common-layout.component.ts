import {Component, OnInit, ViewChild, Inject} from '@angular/core';
import {orderBy, isEmpty} from "lodash";
import { ActivatedRoute, Router } from '@angular/router';
import { ValueFormatterParams, CellClickedEvent } from "@ag-grid-community/core";
import { NzModalService } from '@gs/ng-horizon/modal';
import { of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { HttpProxyService } from "@gs/gdk/services/http";

import {
  formatColumnDefinitionsForGrid,
  AGGridEditMode,
} from "@gs/gdk/grid";
import { MessageType } from '@gs/gdk/core';
import { StateAction } from '@gs/gdk/core';
import {LayoutConfigurationService} from "../../../layout-configuration.service";
import {LayoutsListingGridComponent} from "../../shared/layouts-listing-grid/layouts-listing-grid.component";
import {SubSink} from 'subsink';
import {
    ACTION_COLUMN_DETAIL,
    CONTEXT_MENU_LABELS,
    LAYOUT_LISTING_CONTEXT
} from '../../layout-listing.constants';
import { API_ENDPOINTS, APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import {EnvironmentService} from "@gs/gdk/services/environment";
import { CS360Service } from '@gs/cs360-lib/src/common';

@Component({
  selector: 'gs-common-layout',
  templateUrl: './common-layout.component.html',
  styleUrls: ['./common-layout.component.scss']
})
export class CommonLayoutComponent implements OnInit {

  @ViewChild("gsCommonlayoutlisting", { static:true }) gsCommonlayoutlisting: LayoutsListingGridComponent;

  public config;

  public data: any[];
  public loading = false;
  public dataLoaded = false;

//{360.admin.common_layout.Layouts}=Layouts
//{360.admin.common_layout.Layout}=Layout
  public COMMON_SECTION_GRID_COLUMN_DEF = [
    {
      field: 'label',
      headerName: this.i18nService.translate('360.admin.common_layout.sectionName'),
      minWidth: 300,
      dataType: 'string',
      disabled: true,
      sortable: true,
      cellClass: 'section-link',
    },
    {
      field: 'description',
      headerName: this.i18nService.translate('360.admin.common_layout.description'),
      minWidth: 400,
      dataType: 'textarea',
      sortable: true,
    },
    {
      field: 'sectionLabel',
      headerName: this.i18nService.translate('360.admin.common_layout.type'),
      minWidth: 200,
      dataType: 'string',
      disabled: true,
      sortable: true,
    },
    {
      field: 'usageCount',
      headerName: this.i18nService.translate('360.admin.common_layout.usedIn'),
      minWidth: 150,
      dataType: 'string',
      sortable: true,
      valueFormatter: (params: ValueFormatterParams) => {
        return params && (params.value >= 0) ? (params.value >= 2 || params.value == 0) ? `${params.value}`+' ' + this.i18nService.translate('360.admin.common_layout.Layouts') : `${params.value}`+' '+ this.i18nService.translate('360.admin.common_layout.Layout'): '-';
      }
    },
    {
      field: 'createdBy',
      headerName: this.i18nService.translate('360.admin.common_layout.createdBy'),
      minWidth: 200,
      dataType: 'string',
      sortable: true,
    },
    {
      field: 'createdDate',
      headerName: this.i18nService.translate('360.admin.common_layout.createdOn'),
      minWidth: 200,
      dataType: 'datetime',
      sortable: true,
    },
    {
      field: 'modifiedDate',
      sortable: true,
      headerName:this.i18nService.translate('360.admin.common_layout.modifiedDate'),
      minWidth: 200,
      dataType: 'datetime',
      sort: 'desc'
    },
    {
      field: 'modifiedBy',
      sortable: true,
      headerName: this.i18nService.translate('360.admin.common_layout.modifiedBy'),
      minWidth: 200,
      dataType: 'string',
      hide: true
    }
  ];

  protected subs = new SubSink();

  constructor(public layoutConfigurationService: LayoutConfigurationService,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              protected c360Serice: CS360Service,
              @Inject("envService") protected env: EnvironmentService,
              protected router: Router,
              protected modalService: NzModalService,
              private httpProxyService: HttpProxyService,
              protected route: ActivatedRoute,
              protected i18nService: NzI18nService) { }

  ngOnInit() {
    this.callBootstrapConfig();
    // Get Grid meta data.
    this.config = this.createConfig();
    // Get Layouts
    this.fetchLayouts();
  }

  callBootstrapConfig() {
    let areaName = this.ctx.pageContext.toLowerCase();
    this.httpProxyService.get(API_ENDPOINTS.GET_ADMIN_BOOTSTRAP(areaName)).pipe(switchMap((response) => {
      let config;
      if (response.result) {
        const { data: bootstrapConfig } = response;
        config = { ...bootstrapConfig };
      }
      return of(config);
    })).subscribe((config) => {
        if(config) {
          const moduleConfig = this.env.moduleConfig;
          this.env.moduleConfig = { ...moduleConfig, ...config };
          this.config = this.createConfig();
        }
    });
  }

  createConfig(): any {
    const moduleConfig = this.env.moduleConfig;
    return {
      type: LAYOUT_LISTING_CONTEXT.COMMON,
      options: {
        type: this.i18nService.translate('360.admin.common_layout.sectionType'),
        stateRef: `${this.ctx.pageContext}_${LAYOUT_LISTING_CONTEXT.COMMON}`,
        actions: {
          buttonText: this.i18nService.translate('360.admin.common_layout.buttonText'),
          dropdownHelpText: this.i18nService.translate('360.admin.common_layout.dropdownText'),
          dropdownButton: true,
          showColumnChooser: true,
          options: moduleConfig.sections.filter(s => s.allowedInGlobalSection)
        }
      },
      grid: {
        options: {
          columnDefs: formatColumnDefinitionsForGrid({
            columns: this.COMMON_SECTION_GRID_COLUMN_DEF,
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
          noRowsOverlayComponentParams: {
            title: this.i18nService.translate('360.admin.common_layout.noRowsTitle'),
            message: this.i18nService.translate('360.admin.common_layout.noRowsMessage'),
          },
          onCellClicked: (event: CellClickedEvent) => {
            if(event.colDef.field === 'label') {
              this.navigateToSectionConfigure(event.data);
            }
          },
          getRowNodeId: (data): string => data.sectionId
        },
        mode: AGGridEditMode.NONE,
        additionalOptions: {}
      }
    }
  }

  fetchLayouts(): any {
    this.layoutConfigurationService.invalidateCache();
    this.subs.add(
      this.layoutConfigurationService
        .fetchCommonSections()
        .subscribe((data) => {
          if(!isEmpty(data) && data.length) {
            this.data = data;
            this.dataLoaded = true;
          } else {
            setTimeout(() => {
              this.data = [];
            }, 500);
          }
        })
    );
  }

  onAction(evt: StateAction) {
    const { type, payload } = evt;
    switch (type) {
      case this.i18nService.translate(CONTEXT_MENU_LABELS.VIEW_EDIT):
        this.navigateToSectionConfigure(payload);
        break;
      case this.i18nService.translate(CONTEXT_MENU_LABELS.DUPLICATE):
        this.cloneLayout(payload);
        break;
      case this.i18nService.translate(CONTEXT_MENU_LABELS.DELETE_LAYOUT):
        this.openDeleteLayoutModal(payload);
        break;
      case 'SEARCH':
        this.onSearch(payload);
        break;
      case 'ON_ADD':
        this.onAddSection();
        break;
      case 'ON_DROPDOWNBUTTON_CLICK':
        this.navigateToSection(payload);
      default: null
    }
  }

  onSearch(searchTerm: string) {
    // Do client side filtering.
    const filteredData = this.layoutConfigurationService
      .getCacheByKey('COMMON_SECTIONS')
      .filter(s => s.label.toLowerCase().includes(searchTerm));

    this.data = orderBy(filteredData, ['displayOrder'], ['asc']);
  }

  onAddSection() {}

  cloneLayout(payload: any): void {
    const { sectionId } = payload;
    this.navigateToSection(payload, {
      cloneFrom: sectionId,
      cloneFromLabel: payload.label
    });
  }

  deleteLayout(payload: any): void {
    const { sectionId } = payload;
    this.gsCommonlayoutlisting.showLoader(true);
    this.layoutConfigurationService
      .deleteSection(sectionId)
      .subscribe((data) => {
        this.gsCommonlayoutlisting.showLoader(false);
        if(data.result) {
          this.fetchLayouts();
          this.openToastMessageBar({
            message: this.i18nService.translate('360.admin.common_layout.DELETED_SUCCESS'),
            action: null,
            messageType: MessageType.SUCCESS
          });
        } else {
          this.openToastMessageBar({
            message: data.localizedErrorDesc || data.errorDesc || this.i18nService.translate('360.admin.common_layout.DELETED_FAILURE'),
            action: null,
            messageType: MessageType.ERROR
          });
        }
      });
  }

  openDeleteLayoutModal(payload: any) {
    this.modalService.confirm({
      nzTitle: this.i18nService.translate('360.admin.common_layout.deleteModalTitle'),
      nzContent: this.i18nService.translate('360.admin.common_layout.deleteModalContent'),
      nzOnOk: () => {
        this.deleteLayout(payload);
      },
      nzOkText: this.i18nService.translate('360.admin.common_layout.deleteModalOk')
    });
  }

  public openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.c360Serice.createNotification(messageType, message, 5000);
    }
  }

  protected navigateToSection(payload, extraQueryParams = {}) {
    this.loading = true;
    const { sectionType } = payload;
    this.router.navigate([APPLICATION_ROUTES.SECTION_DETAILS('new')], {queryParams: {type: sectionType, ...extraQueryParams}});
  }

  protected navigateToSectionConfigure(payload) {
    this.loading = true;
    const { sectionId } = payload;
    this.router.navigate([APPLICATION_ROUTES.SECTIONS_CONFIGURE(sectionId)]);
  }

  onContextMenuAction(evt: any, id: string) {

  }

}
