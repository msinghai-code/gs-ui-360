import {Component, OnInit, ComponentFactoryResolver, ComponentFactory, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import {
  AGGridColumn,
  AGGridConfig,
  formatColumnDefinitionsForGrid
} from "@gs/gdk/grid";
import { COLUMN_VIEW } from "@gs/gdk/grid";
import { NETWORK_ACCESS_CONSTS } from '../network-access.constant';
import { NetworkaccessFacade } from './state/networkaccess.facade';
import { Subject, Observable } from 'rxjs';
import { cloneDeep, isEmpty } from 'lodash';
import {NzModalRef, NzModalService} from '@gs/ng-horizon/modal';
import { NzOverlayComponent } from '@gs/ng-horizon/popover';
import {AddEditIPRangeComponent} from "../add-edit-iprange/add-edit-iprange.component";
import { filter } from 'rxjs/operators';
import { NzI18nService } from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-network-access',
  templateUrl: './network-access.component.html',
  styleUrls: ['./network-access.component.scss']
})
export class NetworkAccessComponent implements OnInit, OnDestroy {

  componentSubscription: Subject<any> = new Subject<void>();
  loaded: Observable<boolean> = this.networkaccessFacade.loaded$;
  allIPRange: Observable<any> = this.networkaccessFacade.allIPRange$;
  modalRef: NzModalRef;
  informationMessage: string = this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.PAGE_INFO');
  configurationResponse: any = { byPassMobile: false };
  columnDefs: AGGridColumn[];
  gridOptions: AGGridConfig = { autoResizeColumnsToFit: true};
  @ViewChild(NzOverlayComponent, { static: true }) contextMenuGrid: NzOverlayComponent;
  contextMenuOptions: any[] = [];
  constructor(private modalService: NzModalService, private _cfr: ComponentFactoryResolver, private networkaccessFacade: NetworkaccessFacade, private i18nService: NzI18nService) {
    const params = {
      columns: NETWORK_ACCESS_CONSTS.GRID_OPTIONS(this.i18nService).columns,
      pinnedColumns: [{
        columnName: 'action_column',
        pinnedPosition: "right"
      }],
      actionColumns: [{
        headerName: '',
        field: 'action_column',
        fieldName: 'action_column',
        lockPosition: true,
        pinned: "right",
        stopRowSelection: true,
        columnDataType: COLUMN_VIEW.GRID_ACTION_COLUMN,
            label: 'Action',
            minWidth: 15,
            width: 15,
          }
      ],
      additionalProps: {
        defaultColWidth: 150,
      }
    }
    this.columnDefs = formatColumnDefinitionsForGrid(params as any);
    this.gridOptions = {
        getRowNodeId: (data): string =>  data.address
    }
  }

  ngOnInit() {
    this.getAllIPConfiguration();
    this.networkaccessFacade.getConfiguration$.subscribe(response => {
      if (response) {
        this.configurationResponse = cloneDeep(response);
        this.configurationResponse.byPassMobile = this.configurationResponse ? this.configurationResponse.byPassMobile : false;
      }
    });
  }

  getAllIPConfiguration(): void {
    this.networkaccessFacade.loadAll();
  }

  onBypassToggle() {
    const payload = {
      action: `EDIT`,
      data: this.configurationResponse,
      stateData: this.configurationResponse
    };
    this.configurationResponse.byPassSaveInProgress = true;
    this.networkaccessFacade.upsertConfiguration(payload);
  }

  openAddTrustedIPDialog(value): void {
    value.byPassMobile = this.configurationResponse.byPassMobile;
      this.modalRef = this.modalService.create({
          nzTitle:  value.address ? this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.DIALOG_EDIT_TITLE') : this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.DIALOG_ADD_TITLE'),
          nzContent: AddEditIPRangeComponent,
          nzComponentParams: {data: value},
          nzWidth: 500,
          nzClosable: true,
          nzFooter: [
              {
                  label: this.i18nService.translate('360.admin.network_access.cancel'),
                  onClick: () => this.onModalCancel()
              },
              {
                  label: this.i18nService.translate('360.admin.network_access.save'),
                  type: 'primary',
                  onClick: (contentComponentInstance) => contentComponentInstance.onSave(this.modalRef['nzTitle'])
              }

          ]
      });
  }

  onModalCancel(){
    this.modalRef.destroy();
  }

  openDeleteConfirmation(value): void {
    const deleteMessage = this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.DELETE_CONFIRMATION_MESSAGE',value.address);
    this.modalRef = this.modalService.create({
      nzTitle: this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.DELETE_CONFIRMATION_TITLE'),
      nzContent: deleteMessage,
       nzFooter: [
           {
               label: 'No',
               onClick: () => this.onModalCancel()
           },
          {
            label: 'Yes',
            type: 'primary',
            onClick: () => {
              this.deleteIPRange(value);
            }
          }
        ]
    })
  }

  deleteIPRange(value): void {
    const payload = {
      action: 'DELETE',
      data: value.address,
      stateData: this.configurationResponse
    };
    this.networkaccessFacade.upsertConfiguration(payload);
    this.onModalCancel()
  }

  openContextMenu($event, data) {
    this.contextMenuOptions = [
      { id: 'EDIT', icon: 'edit', label: 'Edit', data },
      { id: 'DELETE', icon: 'delete', label: 'Delete', data },
    ] as any[];
    this.contextMenuGrid.open(new ElementRef($event.target)).subscribe(event => {});
  }

  onContextMenuAction(event: any) {
    switch (event.id) {
      case 'EDIT':
        this.openAddTrustedIPDialog(event.data);
        break;
      case 'DELETE':
        this.openDeleteConfirmation(event.data);
        break;
    }
  }

  columnAction($event: any) {
    if (isEmpty($event.field)) return;
    switch ($event.field) {
      case 'action_column':
        this.openContextMenu($event.event, { address: $event.data.address, description: $event.data.description });
        break;
    }
    $event.event.preventDefault();
    $event.event.stopPropagation();
  }

  ngOnDestroy(): void {
    this.componentSubscription.next();
    this.componentSubscription.complete();
  }
}
