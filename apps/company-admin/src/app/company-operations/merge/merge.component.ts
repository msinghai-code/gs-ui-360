import {Component, OnInit, ComponentFactoryResolver, Inject, TemplateRef} from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { MergeState } from './store/merge.reducers';
import { map, catchError, take, debounceTime, tap, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import * as crudActions from './store/merge.actions';
import { MatSnackBar } from '@angular/material';
import { UpdateModuleTitle } from '@gs/core';
import { HybridHelper } from "@gs/gdk/utils/hybrid";
import { forEach, findIndex, cloneDeep } from 'lodash';
import { MergeDialogComponent } from './merge-dialog.component';
import * as $ from 'jquery';
import { navigationItems } from './navigationItems.component';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { GSWindow } from '@gs/gdk/core/types';
import {ModalButtonOptions, NzModalService, NzModalRef} from '@gs/ng-horizon/modal';
declare let window: GSWindow;
import {NzI18nService} from "@gs/ng-horizon/i18n";

const MERGE_TITLE = "360.merge_comp.MERGE_TITLE";
const MERGE_MESSAGE = "360.merge_comp.MERGE_MESSAGE";
const ERROR_MESSAGE = "360.merge_comp.ERROR_MESSAGE";

@Component({
  selector: 'gs-merge',
  templateUrl: './merge.component.html',
  styleUrls: ['./merge.component.scss']
})
export class MergeComponent implements OnInit {
  public items;
  public home;
  public state$;
  hostname = "";

  navItems = navigationItems;
  navLinks: any;
  inFrame = false;
  activeIndex = 0;
  selectedCompanyList = [];
  redirectLink: any;
  modalRef: NzModalRef;

  constructor(private store: Store<MergeState>, private router: Router, private _snackBar: MatSnackBar,
    private _actRoute: ActivatedRoute, private _cfr: ComponentFactoryResolver, private modalService: NzModalService, @Inject("envService") public _env: EnvironmentService, private i18nService: NzI18nService) {

  }

  ngOnInit() {
    this.state$ = this.store.select((state: any) => state.mergecompany.mergeState)
      .pipe(map(v =>  v), tap(v => {
        this.redirectLink = v.redirectLink,
        this.selectedCompanyList = v.selectedCompanyList;
      }), catchError(v => {
        return of({
          error: true,
          message: "something broke !!"
        });
      }));

    this.navLinks = [{
      path: 'company',
      label: 'Company',
      native: true,
      command: (event: any) => {
        this.store.dispatch(new crudActions.SetRoutePath(0));
        this.router.navigate(['company'], { relativeTo: this._actRoute, queryParams: { companyId1: this.selectedCompanyList[0], companyId2: this.selectedCompanyList[1], redirectUrl: btoa(this.redirectLink) } });
      }
    }, {
      path: 'scorecard',
      label: 'Scorecard',
      native: true,
      command: (event: any) => {
        this.store.dispatch(new crudActions.SetRoutePath(1));
        this.router.navigate(['scorecard'], { relativeTo: this._actRoute, queryParams: { companyId1: this.selectedCompanyList[0], companyId2: this.selectedCompanyList[1], redirectUrl: btoa(this.redirectLink) } });
      }
    }, {
      path: 'timeline',
      label: 'Timeline',
      native: true,
      command: (event: any) => {
        this.store.dispatch(new crudActions.SetRoutePath(2));
        this.router.navigate(['timeline'], { relativeTo: this._actRoute, queryParams: { companyId1: this.selectedCompanyList[0], companyId2: this.selectedCompanyList[1], redirectUrl: btoa(this.redirectLink) } });
      }
    }];

    this.hostname = window.host;
    if (this.hostname === 'SALESFORCE') {
      this.store.dispatch(new UpdateModuleTitle({ label: 'Merge Companies' }));
    }

    this.inFrame = (window.urlParams || {})['inFrame'] + '' === 'true';
    if (this.inFrame) {
      this.setContainerElementsStyles();
    }
  }

  private setContainerElementsStyles() {
    const cdnVersionElement = document.querySelector(".gs-cdn-version") as HTMLElement;
      const tabsElement = document.querySelector(".gs-tabs") as HTMLElement;
      const companyAdminMainContainer = document.querySelector(".gs-tabs-container .gs-tabpanels-wrp .companyAdmin_main_ctn") as HTMLElement;
      const tabPanelsWrapElement = document.querySelector(".gs-tabs-container .gs-tabpanels-wrp") as HTMLElement;
      if(cdnVersionElement) {
        cdnVersionElement.style.display = "none";
      }
      if(tabsElement) {
        tabsElement.style.display = "none";
      }
      if(companyAdminMainContainer) {
        companyAdminMainContainer.style.padding = "0";
      }
      if(tabPanelsWrapElement) {
        tabPanelsWrapElement.style.margin = "0";
      }
  }

  // Not using this method as we are showing only one screen (company) for merge
  public navigateNext(item, currentItem?) {
    if (currentItem === "timeline") {
      this.mergeCompany();
      return;
    } else {
      this.loadNextModule(item);
    }
  }

  loadNextModule(item) {
    this.store.dispatch({ type: "SET_ACTIVE_MODULE", payload: item });
    const idx = findIndex(this.navLinks, { 'path': item });
    this.store.dispatch(new crudActions.SetRoutePath(idx));
    this.state$.pipe(debounceTime(300), take(1)).subscribe(state => {
      this.router.navigate([item], { relativeTo: this._actRoute, queryParams: { companyId1: state.selectedCompanyList[0], companyId2: state.selectedCompanyList[1], redirectUrl: btoa(state.redirectLink) } });
    });
  }

  onBackClick() {
    this.router.navigate([this.redirectLink]);
  }

  mergeCompany() {
    this.state$.pipe(take(1)).subscribe(value => {
      const state = cloneDeep(value);
      if (state.errorIndex.length) {
        this._snackBar.open(this.i18nService.translate(ERROR_MESSAGE), '', { duration: 3000 });
      } else {
        this.openModalDialog(this.i18nService.translate(MERGE_TITLE), this.i18nService.translate(MERGE_MESSAGE));
      }
    });
  }

  openModalDialog(title: string, msgString: string) {
    const componentData = { msgString };
    // const dialog: TemplateRef<MergeDialogComponent> = this._cfr.resolveComponentFactory<MergeDialogComponent>(MergeDialogComponent);
    // return this._dms.open(dialog, { title, componentData });
    this.modalRef = this.modalService.create({
      nzTitle: title,
      nzContent: MergeDialogComponent,
      nzWidth: 820,
      nzClassName:'delete-dialog-modal',
      nzClosable: true,
      nzFooter: [
          {
              label: this.i18nService.translate('360.company-admin.merge_comp.Cancel'),
              shape:'round',
              onClick: () => this.onModalCancel(),

          },
        {
            label: this.i18nService.translate('360.company-admin.merge_comp.Confirm'),
            onClick: () => this.onModalOk(),
            type: 'primary',
            shape: 'round',
            disabled:  contentComponentInstance => contentComponentInstance.actions[0].disabled
        }

        ],
      nzComponentParams: { inputData: msgString }
    });
  }

  onModalCancel(){
      this.modalRef.destroy();
  }
    onModalOk(){
        this.state$.pipe(take(1)).subscribe(value => {
            const state = cloneDeep(value);
            const masterRecord = state.postquery.masterRecord;
            const masterDataAggregation = {};
            const masterDataAlterations = {};
            state.postquery.masterDataAggregation = {};
            state.postquery.masterDataAlterations = {};
            forEach(state.data, (field) => {
                if (field.selectedCompany && field.selectedCompany !== masterRecord) {
                    masterDataAlterations[field.fieldName] = field.selectedCompany;
                }
                if (field.aggregationType) {
                    masterDataAggregation[field.fieldName] = field.aggregationType;
                }
            });
            state.postquery.masterDataAggregation = masterDataAggregation;
            state.postquery.masterDataAlterations = masterDataAlterations;
            this.store.dispatch(new crudActions.MergeCompany(state.postquery));
            this.state$.pipe(debounceTime(300), take(2)).subscribe(state => {
                if(state.mergeSuccess) {
                    if(state.redirectLink) {
                        if (window["GS"].hybridHostType === "SALESFORCE" && !this.inFrame) {
                            HybridHelper.navigateToURL(state.redirectLink);
                        } else {
                            window.open(state.redirectLink, '_self');
                        }
                    } else {
                        this.router.navigate([""]);
                    }
                }
                this.modalRef.destroy();
            });
        });
    }

}


