import { Component, Inject, OnInit, ViewChild, EventEmitter } from '@angular/core';
import {orderBy, sortBy, isEmpty } from "lodash";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import {
  formatColumnDefinitionsForGrid,
  AGGridEditMode,
} from "@gs/gdk/grid";
import { StateAction } from '@gs/gdk/core';
import { setToolTipValueGetter } from "@gs/gdk/grid";
import { DescribeService } from "@gs/gdk/services/describe";
import {ValueFormatterParams, CellClickedEvent, GridOptions} from '@ag-grid-community/core';
import { NzModalService } from '@gs/ng-horizon/modal';
import {LayoutConfigurationService} from "../../layout-configuration.service";
import {LayoutsListingGridComponent} from "../shared/layouts-listing-grid/layouts-listing-grid.component";
import { ActivatedRoute, Router } from '@angular/router';
import {SubSink} from 'subsink';
import {
    ACTION_COLUMN_DETAIL,
    CONTEXT_MENU_LABELS, LAYOUT_LISTING_CONSTANTS,
    LAYOUT_LISTING_CONTEXT,
    PREVIEW_COLUMN_DETAIL
} from '../layout-listing.constants';
import { APPLICATION_ROUTES, PageContext } from '@gs/cs360-lib/src/common';
import { MDA_HOST } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import {LayoutStatus} from "../../layout-upsert/layout-upsert.constants";
import { EnvironmentService } from "@gs/gdk/services/environment";
import {NzNotificationService} from "@gs/ng-horizon/notification";
import { StatusCellRendererComponent } from "@gs/gdk/grid";
import { TranslocoService } from '@ngneat/transloco';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { take } from 'rxjs/operators';

@Component({
  selector: 'gs-standard-layout',
  templateUrl: './standard-layout.component.html',
  styleUrls: ['./standard-layout.component.scss']
})

export class StandardLayoutComponent implements OnInit {
  renameForm: FormGroup;

  @ViewChild("gsStandardlayoutlisting", { static:true }) gsStandardlayoutlisting: LayoutsListingGridComponent;
  
  public config;
  public data: any[];
  public loading = false;
  public showRenameModal:boolean = false;
  public isRenameSaveDisabled:boolean = true;
  public dataLoaded = false;


  describeData: any = {loading: true};
  allGroupByTypes;
  allGroupByTypesMap; // Gsid vs Name
  groupByTypeSelected;
  groupByTypeId;
  sortBy;
  translatedlabelsResponse;
  public LAYOUT_LIST_GRID_COLUMN_DEF: any=[];
  
  protected subs = new SubSink();

  showPreview: boolean = false;
  isPartner: boolean = false;
  params: any = {};

  constructor(public layoutConfigurationService: LayoutConfigurationService,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              public router: Router,
              protected route: ActivatedRoute,
              protected fb: FormBuilder,
              protected describeService: DescribeService,
              protected modalService: NzModalService,
              protected notification: NzNotificationService,
              protected translocoService: TranslocoService,
              protected i18nService: NzI18nService,
              @Inject("envService") protected env: EnvironmentService) {
                    this.getTranslations();
  }

  ngOnInit() {
    this.isPartner = this.router.url.includes('partner') ? true: false;
    this.sortBy = [this.ctx.standardLayoutConfig.sortBy];
    // Get Grid meta data.
    const moduleConfig = this.env.moduleConfig;
    const { layoutNameCharLimit, layoutDescriptionCharLimit } = moduleConfig;
    this.renameForm = this.fb.group({
      name: [null, [Validators.required, extraSpaceValidator, Validators.maxLength(layoutNameCharLimit)]],
      description: [null, [Validators.maxLength(layoutDescriptionCharLimit)]]
    });
    this.config = this.createConfig();
    // Get Layouts
    this.fetchLayouts();

    if(this.ctx.manageAssignmentConfig.showManageAssignment) {
      const objectList = [... this.ctx.layoutAssignConfig.objectList];
      objectList.forEach(obj => {
        this.describeService.getObjectTree(MDA_HOST, obj.objectName, 1).then(data => {
          this.describeData = {...this.describeData, loading: false, [obj.objectName]: data};
        });
      });
    }

    if(this.ctx.standardLayoutConfig.groupByType) {
      this.groupByTypeId = this.ctx.standardLayoutConfig.groupByType.typeId;
      this.fetchAllGroupByTypes();
    }
    // this.params.entity = Cs360ContextUtils.getTranslatedBaseObjectNameV2(Cs360ContextUtils.getContextToEntityNameMapping(this.ctx.pageContext));
    this.params.entity = this.ctx.standardLayoutConfig.labelForTranslation;
  }

    protected getTranslations() {
        this.translocoService.selectTranslateObject('360.admin.standard_layout')
            .pipe(take(1))
            .subscribe(result => {
            this.translatedlabelsResponse = result;
            this.LAYOUT_LIST_GRID_COLUMN_DEF = [
                    {
                        field: 'name',
                        sortable: true,
                        headerName: result.layoutName,
                        lockPosition: true,
                        pinned: "left",
                        suppressMovable: true,
                        minWidth: 200,
                        dataType: 'string',
                        disabled: true
                    },
                    {
                        field: 'description',
                        sortable: true,
                        headerName: result.description,
                        minWidth: 300,
                        dataType: 'textarea'
                    },
                    {
                        field: 'sectionCount',
                        sortable: true,
                        headerName: result.sections,
                        minWidth: 110,
                        dataType: 'string',
                        // type: 'numericColumn',
                        // disabled: true
                    },
                    {
                        field: 'status',
                        sortable: true,
                        headerName: result.status,
                        minWidth: 130,
                        dataType: 'string',
                        cellRendererFramework: StatusCellRendererComponent,
                        valueFormatter: (params: ValueFormatterParams) => {
                            switch (params.value) {
                                case 'ASSIGNED' || result.assigned:
                                    return {
                                        label: result.assigned,
                                        tagClass: "assigned",
                                        color: "#D0F3E5"
                                    }
                                case 'DEFAULT' || result.default:
                                    return {
                                        label: result.default,
                                        tagClass: "default",
                                        color: "#e8eaf7"
                                    }
                                case 'UNASSIGNED' || result.unassigned:
                                    return {
                                        label: result.unassigned,
                                        tagClass: "unassigned",
                                        color: "#FFFFFF"
                                    }
                                case 'DRAFT' || result.draft:
                                    return {
                                        label: result.draft,
                                        tagClass: "draft",
                                        color: "#FEF3D1"
                                    }
                            }
                        }
                    },
                    {
                        field: 'createdBy',
                        sortable: true,
                        headerName: result.createdBy,
                        minWidth: 200,
                        dataType: 'string'
                    },
                    {
                        field: 'createdDate',
                        sortable: true,
                        headerName: result.createdOn,
                        minWidth: 200,
                        dataType: 'datetime',
                    },
                    {
                        field: 'modifiedDate',
                        sortable: true,
                        headerName: result.modifiedDate,
                        minWidth: 200,
                        dataType: 'datetime',
                        sort: 'desc'
                    },
                    {
                        field: 'modifiedBy',
                        sortable: true,
                        headerName: result.modifiedBy,
                        minWidth: 200,
                        dataType: 'string',
                        hide: true
                    }
                ];
            });
    }

  submitForm(): void {
    for (const i in this.renameForm.controls) {
      this.renameForm.controls[i].markAsDirty();
      this.renameForm.controls[i].updateValueAndValidity();
    }
  }
 
  createConfig(): any {
    let type = this.translatedlabelsResponse && this.translatedlabelsResponse[`${this.ctx.pageContext.toLowerCase()}Layouts`] ? this.translatedlabelsResponse[`${this.ctx.pageContext.toLowerCase()}Layouts`]: 'C360 Layouts';
    let dropdownHeader = false;
    let dropdownHelpText='';
    // for now adding this column in listing
    if(this.ctx.standardLayoutConfig.extraColInfo) {
      dropdownHeader = true;
      type = this.translatedlabelsResponse?this.translatedlabelsResponse.allLayouts:'All Layouts';
      const headerName = this.translatedlabelsResponse? this.translatedlabelsResponse[this.ctx.standardLayoutConfig.extraColInfo.config.headerName]: this.ctx.standardLayoutConfig.extraColInfo.alternateHeaderName;
      this.LAYOUT_LIST_GRID_COLUMN_DEF.unshift({...this.ctx.standardLayoutConfig.extraColInfo.config, headerName});
    }
    type = this.router.url.includes('partner') ? this.i18nService.translate('360.admin.standard_layout.partnerLayouts') : type;
    return {
      type: LAYOUT_LISTING_CONTEXT.STANDARD,
      options: {
        type,
        stateRef: `${this.ctx.pageContext}_${LAYOUT_LISTING_CONTEXT.STANDARD}`,
        actions: {
          buttonText: this.translatedlabelsResponse? this.translatedlabelsResponse.addLayout: 'Add Layout',
          showColumnChooser: true,
          dropdownHeader,
          dropdownHelpText,
      }
      },
      grid: {
        options: {
          columnDefs: formatColumnDefinitionsForGrid({
            columns: this.LAYOUT_LIST_GRID_COLUMN_DEF,
            pinnedColumns: [{columnName: 'preview_column', pinnedPosition: "right"}, {columnName: 'action_column', pinnedPosition: "right"}],
            actionColumns: [PREVIEW_COLUMN_DETAIL, ACTION_COLUMN_DETAIL],
            additionalProps: {
              enableTooltip: true,
              lockPinned: true
            },
            callbacks: {
              tooltipCallback: (key, dataType) => {
                if(key === "status") {
                  return (params) => {
                      switch (params.value) {
                          case 'ASSIGNED' || this.translatedlabelsResponse.assigned:
                              return this.translatedlabelsResponse.assigned;
                          case 'DEFAULT' || this.translatedlabelsResponse.default:
                              return this.translatedlabelsResponse.default;
                          case 'UNASSIGNED' || this.translatedlabelsResponse.unassigned:
                              return this.translatedlabelsResponse.unassigned;
                          case 'DRAFT' || this.translatedlabelsResponse.draft:
                              return this.translatedlabelsResponse.draft;
                      }
                  };
                }
                return setToolTipValueGetter(key, dataType);
              }
            }
          }),
          defaultColDef: {
            sortable: false,
            filter: false,
          },
          accentedSort: true,
          noRowsOverlayComponentParams: {
            title: this.translatedlabelsResponse? this.translatedlabelsResponse.noLayoutsFound: 'No Layouts found',
            message: this.translatedlabelsResponse? this.translatedlabelsResponse.adjustSearch: 'Try adjusting your search.'
          },
          onCellClicked: (event: CellClickedEvent) => {
            if(event.colDef.field === 'name') {
              this.loading = true;
              if(!!event.data && this.ctx.standardLayoutConfig.groupByType && !!event.data[this.ctx.standardLayoutConfig.groupByType.typeId]) {
                if(this.isPartner) {
                  this.router.navigate([APPLICATION_ROUTES.LAYOUT_CONFIGURE(event.data.layoutId)], {queryParams: {typeId: event.data[this.ctx.standardLayoutConfig.groupByType.typeId], managedAs: "partner"}});
                } else {
                  this.router.navigate([APPLICATION_ROUTES.LAYOUT_CONFIGURE(event.data.layoutId)], {queryParams: {typeId: event.data[this.ctx.standardLayoutConfig.groupByType.typeId]}});
                }
              } else {
                if(this.isPartner) {
                  this.router.navigate([APPLICATION_ROUTES.LAYOUT_CONFIGURE(event.data.layoutId)], {queryParams: {managedAs: "partner"}});
                } else {
                  this.router.navigate([APPLICATION_ROUTES.LAYOUT_CONFIGURE(event.data.layoutId)]);
                }
              }
            }
          },
          groupDisplayType: 'groupRows',
          groupDefaultExpanded: 1,
            groupRowRendererParams: (params) => {
            return this.allGroupByTypesMap[params.value]
          },
          getRowNodeId: (data): string => data.layoutId
        } as GridOptions,
        mode: AGGridEditMode.NONE,
        additionalOptions: {}
      }
    }
  }

  fetchAllGroupByTypes(): any {
    this.allGroupByTypes = this.env.moduleConfig[this.ctx.standardLayoutConfig.groupByType.type];
    this.config.options.actions.headerOptions = sortBy(
      this.allGroupByTypes.map(type => {
        type.label = type.Name;
        return type;
      }),
      ['label'], ['asc']
    );
  
    this.allGroupByTypesMap = {};
    this.allGroupByTypes.forEach(type => {
      this.allGroupByTypesMap[type.Gsid] = type.Name;
    });
  }

  fetchLayouts(): any {
    this.layoutConfigurationService.invalidateCache();
    this.gsStandardlayoutlisting.showLoader(true);
    this.subs.add(
      this.layoutConfigurationService
        .fetchStandardLayouts(this.isPartner)
        .subscribe((data) => {
          this.gsStandardlayoutlisting.showLoader(false);
          this.data = data;
          this.dataLoaded = true;
          if(this.groupByTypeSelected) {
            this.filterBasedOnGroupByType(this.groupByTypeSelected);
          }
        })
    );
  }

  renameSectionCancel(){
    this.showRenameModal = false;
  }

  renameSectionSave(){
    if (this.renameForm.valid) {
      // const {name, description, layoutId, entityType, relationshipTypeId} = this.renameForm.value;
      this.renameLayout(this.renameForm.value);
    } 
  }

  onAction(evt: StateAction) {
    const { type, payload } = evt;
    switch (type) {
      case this.i18nService.translate(CONTEXT_MENU_LABELS.CONTINUE_DRAFT):
        this.loading = true;
        if(this.isPartner) {
          this.router.navigate([APPLICATION_ROUTES.LAYOUT_CONFIGURE(payload.layoutId)], {queryParams: {mode: "create", typeId: payload[this.groupByTypeId], managedAs: "partner"}});
        } else {
          this.router.navigate([APPLICATION_ROUTES.LAYOUT_CONFIGURE(payload.layoutId)], {queryParams: {mode: "create", typeId: payload[this.groupByTypeId]}});
        }
        break;
      case this.i18nService.translate(CONTEXT_MENU_LABELS.VIEW_EDIT):
        this.loading = true;
        if(this.isPartner) {
          this.router.navigate([APPLICATION_ROUTES.LAYOUT_CONFIGURE(payload.layoutId)], {queryParams: {typeId: payload[this.groupByTypeId], managedAs: "partner"}});
        }else {
          this.router.navigate([APPLICATION_ROUTES.LAYOUT_CONFIGURE(payload.layoutId)], {queryParams: {typeId: payload[this.groupByTypeId]}});
        }
        break;
      case this.i18nService.translate(CONTEXT_MENU_LABELS.RENAME):
        const moduleConfig = this.env.moduleConfig;
        const { layoutNameCharLimit, layoutDescriptionCharLimit } = moduleConfig;
        this.renameForm = this.fb.group({
          name: [payload.name, [Validators.required, extraSpaceValidator, Validators.maxLength(layoutNameCharLimit)]],
          description: [payload.description, [Validators.maxLength(layoutDescriptionCharLimit)]],
          layoutId: [payload.layoutId],
          entityType: [payload.entityType],
          [this.groupByTypeId]: [payload[this.groupByTypeId]]
        });
        this.showRenameModal = true;
        this.renameForm.valueChanges.subscribe(formValue => {
          if(formValue.name !== payload.name || formValue.description !== payload.description) {
            this.isRenameSaveDisabled = false;
          }
          else {
            this.isRenameSaveDisabled = true;
          }   
        })
        break;
      case this.i18nService.translate(CONTEXT_MENU_LABELS.ASSIGN_LAYOUT):
        this.loading = true;
        if(this.isPartner) {
          this.router.navigate([APPLICATION_ROUTES.LAYOUT_ASSIGN(payload.layoutId)],{queryParams: {typeId: payload[this.groupByTypeId], managedAs: "partner"}});
        } else {
          this.router.navigate([APPLICATION_ROUTES.LAYOUT_ASSIGN(payload.layoutId)],{queryParams: {typeId: payload[this.groupByTypeId]}});
        }
        break;
      case this.i18nService.translate(CONTEXT_MENU_LABELS.DUPLICATE):
        this.cloneLayout(payload);
        break;
      case this.i18nService.translate(CONTEXT_MENU_LABELS.MARK_AS_DEFAULT):
        this.openMarkAsDefaultModal(payload);
      break;
      case this.i18nService.translate(CONTEXT_MENU_LABELS.DELETE_LAYOUT):
        this.openDeleteLayoutModal(payload);
        break;
      case 'SEARCH':
        this.onSearch(payload);
        break;
      case 'ON_ADD':
        this.loading = true;
        if(this.isPartner) {
          this.router.navigate([APPLICATION_ROUTES.LAYOUT_DETAILS('new')], {queryParams: {mode: "create", context: this.ctx.baseObject, managedAs: "partner"}});
        } else {
          this.router.navigate([APPLICATION_ROUTES.LAYOUT_DETAILS('new')], {queryParams: {mode: "create", context: this.ctx.baseObject}});
        }
        break;
      case 'ON_DROPDOWNHEADER_CLICK':
        this.filterBasedOnGroupByType(payload);
        break;
      case 'ON_PREVIEW':
        const layoutId = payload.layoutId;
        const typeId =  payload[this.groupByTypeId];
        this.openLayoutPreview(layoutId, typeId);
        break;
      default: null
    }
  }

  openLayoutPreview(layoutId: string, relTypeId: string) {
    if(sessionStorage) {
      try {
        //saving this page url to sessionStorage to use when user tries to come back from preview page
        let layoutsType: string = this.isPartner ? 'partner' : 'standard';
        sessionStorage.setItem('previewCallBackURL', `${this.ctx.pageContext.toLowerCase()}#/${layoutsType}`);
      } catch (e) {
        throw new Error('Sessionstorage is not supported.');
      }
    }
    this.params = {
      ...this.params,
      layoutId,
      relTypeId
    }
    this.showPreview = true;
  }

  onSearch(searchTerm: string) {
    // Do client side filtering.
    
    let filteredData = this.layoutConfigurationService.getCacheByKey('LAYOUTS');
      
    if(this.groupByTypeSelected && this.groupByTypeSelected.Gsid) {
      filteredData = filteredData.filter(l => l[this.groupByTypeId] === this.groupByTypeSelected.Gsid);
    }
    
    filteredData = filteredData.filter(l => l.name.toLowerCase().includes(searchTerm));

    this.data = orderBy(filteredData, this.sortBy, ['asc']);
  }

  filterBasedOnGroupByType(groupByType) {
    this.groupByTypeSelected = groupByType;
    let layoutData = this.layoutConfigurationService.getCacheByKey('LAYOUTS');
    if(groupByType.value === 'all') {
      this.config.grid.options.columnDefs[0].rowGroup = true;
      this.config.options.actions.dropdownHelpText= this.translatedlabelsResponse.allDropdownHelpText;
    } else {
      this.config.grid.options.columnDefs[0].rowGroup = false;
      layoutData = layoutData.filter(l => l[this.groupByTypeId] === groupByType.Gsid);
      this.config.options.actions.dropdownHelpText= this.translatedlabelsResponse.dropdownHelpText;
    }

    this.config = { ...this.config };

    this.data = orderBy(layoutData, this.sortBy, ['asc']);
    
  }

  cloneLayout(payload: any): void {
    this.loading = true;
    if(this.isPartner) {
      this.router.navigate([APPLICATION_ROUTES.LAYOUT_DETAILS('new')], {
        queryParams: {
          mode: 'create',
          typeId: payload[this.groupByTypeId],
          cloneFrom: payload.layoutId,
          name: payload.name,
          managedAs: "partner"
        }
      });
    } else {
      this.router.navigate([APPLICATION_ROUTES.LAYOUT_DETAILS('new')], {
        queryParams: {
          mode: 'create',
          typeId: payload[this.groupByTypeId],
          cloneFrom: payload.layoutId,
          name: payload.name
        }
      });
    }

  }


  openDeleteLayoutModal(payload: any) {
    const objectName = this.ctx.objectName;
    this.modalService.confirm({
      nzTitle: this.translatedlabelsResponse.deleteLayout,
      nzWrapClassName: "vertical-center-modal",
      nzContent: payload.status === LayoutStatus.ASSIGNED ? this.translocoService.translate('360.admin.standard_layout.assignedLayoutContent',{objectName: objectName}): this.translatedlabelsResponse.deleteLayoutContent,
      nzOnOk: () => {
        this.deleteLayout(payload);
      },
      nzOkText: this.translatedlabelsResponse.deleteLayoutOkText,
      nzCancelText: this.translatedlabelsResponse.deleteLayoutCancelText
    });
  }
  openMarkAsDefaultModal(payload: any) {
    this.modalService.confirm({
      nzTitle: this.translocoService.translate('360.admin.standard_layout.markAsDefModalTitle'),
      nzWrapClassName: "vertical-center-modal",
      nzContent: this.translocoService.translate('360.admin.standard_layout.markAsDefModalContent',  {param: payload.name}),
      nzOkText: this.translocoService.translate('360.admin.standard_layout.markAsDefModalOKText'),
      nzCancelText: this.translocoService.translate('360.admin.standard_layout.markAsDefModalCancelText'),
      nzOnOk: () => {
        this.markAsDefault(payload);
      }
     
    });
   
  }

  protected markAsDefault(payload: any) {
    this.gsStandardlayoutlisting.showLoader(true);
    this.layoutConfigurationService
        .markAsDefault(payload.layoutId, payload[this.groupByTypeId], this.isPartner)
        .subscribe((data) => {
          this.fetchLayouts();
          this.gsStandardlayoutlisting.showLoader(false);
          this.handleNotifications(data, this.i18nService.translate('360.admin.layout_constants.MARKED_AS_DEFAULT'));
        });
  }

  protected renameLayout(payload: any): void {
    this.gsStandardlayoutlisting.showLoader(true);
    if(this.isPartner) {
      payload.managedAs = "partner";
    }
    this.layoutConfigurationService.renameLayout({
      ...payload,
      name: payload.name,
      description:payload.description,
      layoutId:payload.layoutId,
      entityType:payload.entityType,
      [this.groupByTypeId]:payload[this.groupByTypeId]
    }).subscribe(response => {
      this.fetchLayouts();   
      if(!response.success) {
        // this.toastMessageService.add(response.error.message, MessageType.ERROR, null, { duration: 5000 });
        this.notification.create('error','',response.error.message, [],{nzDuration:5000})
        return;
      } else {
        // this.toastMessageService.add("Layout Renamed Succesfully.", MessageType.SUCCESS, null, {horizontalPosition:"center",duration:5000},);
        this.notification.create('success','',this.i18nService.translate('360.admin.standard_layout.layoutRenamedSuccess'), [],{nzDuration:5000})
        this.showRenameModal = false;
        this.isRenameSaveDisabled = true;
      }
    });
  }

  protected deleteLayout(payload: any): void {
    this.gsStandardlayoutlisting.showLoader(true);
    this.layoutConfigurationService
        .deleteLayout(payload.layoutId, payload[this.groupByTypeId])
        .subscribe((data) => {
           this.fetchLayouts();        
          this.gsStandardlayoutlisting.showLoader(false);
          this.handleNotifications(data, this.i18nService.translate('360.admin.layout_constants.DELETED_SUCCESS'));
        });
    }

  protected handleNotifications(response, message) {
    if(response.success) {
      // this.openToastMessageBar({message, action: null, messageType: MessageType.SUCCESS});
        this.notification.create('success','', message, [],{nzDuration:5000})
    } else {
      // this.openToastMessageBar({message: response.error.message, action: null, messageType: MessageType.ERROR});
        this.notification.create('error','', message, [],{nzDuration:5000})
    }
  }

  public openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.notification.create(messageType,'',message, [],{nzDuration:5000})
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}


