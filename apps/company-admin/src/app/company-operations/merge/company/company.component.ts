import { Component, OnInit, ComponentFactoryResolver, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { MergeCompanyState, MergeState } from '../store/merge.reducers';
import { getMergeState } from '../store/merge.selectors';
import * as crudActions from '../store/merge.actions';
import { filter, take } from 'rxjs/operators';
import { MergeAllowedDialogComponent } from '../merge-allowed.component';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { GSWindow } from '@gs/gdk/core/types';
import { NzModalService } from '@gs/ng-horizon/modal';
import { cloneDeep, forEach, union, debounce } from 'lodash';
import {NzI18nService} from "@gs/ng-horizon/i18n";

const DATATYPES = ['CURRENCY', 'NUMBER', 'PERCENT', 'PERCENTAGE'];
const AGG_TYPES = [{label:'360.company_comp.SUM', val:'SUM'}, {label:'360.company_comp.MIN', val:'MIN'}, {label:'360.company_comp.MAX', val: 'MAX'}, {label:'360.company_comp.AVG', val: 'AVG'}];
const SHOW_ALL_FIELDS_MSG = "360.company_comp.SHOW_ALL_FIELDS_MSG";
const SHOW_DIFFERENT_FIELDS_MSG = "360.company_comp.SHOW_DIFFERENT_FIELDS_MSG";
const SHOW_ALL_BTN_MSG = "360.company_comp.SHOW_ALL_BTN_MSG";
const SHOW_DIFF_BTN_MSG = "360.company_comp.SHOW_DIFF_BTN_MSG"
const MERGE_NOT_ALLOWED_TITLE = "360.company_comp.MERGE_NOT_ALLOWED_TITLE";
declare let window: GSWindow;

@Component({
  selector: 'gs-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {

  mergeData$: Observable<MergeState>;
  dataTypeList: Array<string> = DATATYPES;
  aggregationTypes: any = AGG_TYPES;
  masterRecord: any;
  selectedCompanyList = [];
  errorIndexList: Array<any> = [];
  showMsg: string = this.i18nService.translate(SHOW_DIFFERENT_FIELDS_MSG);
  showbtnLabel: string = this.i18nService.translate(SHOW_ALL_BTN_MSG);
  showBtnIndx: number = 0;
  currencySymbol: string = '';
  redirectUrl: string = '';
  disableOptions: boolean = false;
  userLocale: any;
  companyDocumentationUrl = "";

  timeZone: string;
  dateFormat: string;
  dateTimeFormat: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store<MergeCompanyState>,
    @Inject("envService") private _env: EnvironmentService,
    private router: Router,
    private _cfr: ComponentFactoryResolver,
    private modalService: NzModalService,
    private i18nService: NzI18nService
  ) {
    this.store.dispatch(new crudActions.SetRoutePath(0));

    this.currencySymbol = window['GS'] &&
      window['GS'].userConfig &&
      window['GS'].userConfig.instance &&
      window['GS'].userConfig.instance.currency &&
      window['GS'].userConfig.instance.currency.symbol || '$';

    if (window['GS'] && window['GS'].userConfig && window['GS'].userConfig && window['GS'].userConfig.user && window['GS'].userConfig.user.locale) {
      this.userLocale = window['GS'].userConfig.user.locale;
      this.timeZone = window['GS'].userConfig.user.locale.timeZone;
      this.dateFormat = window['GS'].userConfig.user.locale.dateFormat;
      this.dateTimeFormat = window['GS'].userConfig.user.locale.dateTimeFormat;
    }

    let companyPayload = {
      "objectName": "company",
      "select": [
        "Name",
        "Gsid"
      ],
      "where": null,
      "orderBy": {
        "Name": "asc"
      },
      "limit": 100
    };

    this.activatedRoute.queryParams.subscribe(item => {
      this.store.dispatch(new crudActions.SetInitialState());
      this.store.dispatch(new crudActions.SetRedirectLink(item.redirectUrl));
      if (item.companyId1 && item.companyId1) {
        this.selectedCompanyList = [item.companyId1, item.companyId2];
        this.redirectUrl = item.redirectUrl;
        this.disableOptions = true;

        let state = this.store.pipe(select(getMergeState));
        state.pipe(filter(val => val["postquery"] !== undefined), take(1)).subscribe(st => {
          if (!st["postquery"].masterRecord) {
            this.store.dispatch(new crudActions.SetCompanyList(cloneDeep(this.selectedCompanyList)));
            let companyquery = {
              "select": [
              ],
              "where": {
                "conditions": [
                  {
                    "name": "Gsid",
                    "alias": "A",
                    "value": this.selectedCompanyList,
                    "operator": "IN"
                  }
                ],
                "expression": "A"
              }
            }

            this.store.dispatch(new crudActions.LoadCompanyData(companyquery));
            this.selectMasterField(0, true, true);
          }
        });
      } else {
        this.store.dispatch(new crudActions.SetCompanyList([]));
        this.store.dispatch(new crudActions.LoadCompanyList(companyPayload));
      }
    });

    this.mergeData$ = this.store.pipe(select(getMergeState));
    this.mergeData$.pipe(filter(x => {
      return x.allowMerge !== 0;
    }), take(1)).subscribe(data => {
      if (data.allowMerge === 2) {
        this.showNoMergeMsg();
      }
    });
  }

  ngOnInit() {
    this.masterRecord = 0;
    if (window.host === 'SALESFORCE') {
      this.companyDocumentationUrl = "https://support.gainsight.com/SFDC_Edition/Data_Management/Managing_Data_In_Gainsight/Company_Merge";
    } else {
      this.companyDocumentationUrl = "https://support.gainsight.com/Gainsight_NXT/02Data_Management/02Managing_Data_In_Gainsight/Company_Merge";
    }
  }

  showNoMergeMsg() {
    let path;
    if (window.host === 'SALESFORCE') {
      path = "Administration -> Operations -> Data Operation";
    } else {
      path = "Administration -> General -> Company -> Data Operations";
    }

    this.openModalDialog(this.i18nService.translate(MERGE_NOT_ALLOWED_TITLE), path);
  }

  openModalDialog(title: string, path: string) {

    const componentData = {
      path
    };
    // const dialog = this._cfr.resolveComponentFactory<MergeAllowedDialogComponent>(
    //   MergeAllowedDialogComponent
    // );
    // return this._dms.open(dialog, { title, componentData });
    return this.modalService.create({
      nzTitle: title,
      nzWidth: 600,
      nzContent: MergeAllowedDialogComponent,
      nzComponentParams: {inputData: componentData},
        nzOnOk: () => this.router.navigate(['']),
        nzOnCancel: () => this.router.navigate([''])
    });
  }

  selectMasterField(record, selectAllRecords?: boolean, checkIfNeedsToBeUpdated?: boolean) {
    this.masterRecord = record;
    const recordObj = {
      masterRecord: this.selectedCompanyList[record],
      mergeRecord: record === 0 ? [this.selectedCompanyList[1]] : [this.selectedCompanyList[0]],
      companyIndex: record,
      checkIfNeedsToBeUpdated
    };
    if(selectAllRecords) {
      const payload = {
        index: record,
        company: this.selectedCompanyList[record]
      };
      this.store.dispatch(new crudActions.UpdateAllRecords(payload));
    }
    this.store.dispatch(new crudActions.SetMasterRecord(recordObj));
  }

  onCompanySearch(searchTerm) {
    // console.log('On search >>>>>>>>>>', searchTerm);
    this.dispatchSearchDebounced(searchTerm);
  }

  dispatchSearchDebounced = debounce((searchTerm) => {
    this.store.dispatch(new crudActions.LoadCompanyList({
      "objectName": "company",
      "select": [
        "Name",
        "Gsid"
      ],
      "where": {
        "expression": "grid_0",
        "conditions": [
          {
            "alias": "grid_0",
            "name": "Name",
            "operator": "CONTAINS",
            "value": [
              searchTerm
            ]
          }
        ]
      },
      "orderBy": {
        "Name": "asc"
      },
      "limit": 100
    }));
  }, 300);

  selectCompany(selectedCompany, idx) {
    this.selectedCompanyList = [...this.selectedCompanyList];
    this.selectedCompanyList[idx] = selectedCompany.Gsid;
    this.store.dispatch(new crudActions.UpdateDDList({
      companayIdx: idx,
      gsid: selectedCompany.Gsid
    }))
    if (this.selectedCompanyList[0] && this.selectedCompanyList[1]) {
      let companyquery = {
        "select": [
        ],
        "where": {
          "conditions": [
            {
              "name": "Gsid",
              "alias": "A",
              "value": this.selectedCompanyList,
              "operator": "IN"
            }
          ],
          "expression": "A"
        }
      }

      this.store.dispatch(new crudActions.SetCompanyList(this.selectedCompanyList));
      this.store.dispatch(new crudActions.LoadCompanyData(companyquery));
      this.mergeData$ = this.store.pipe(select(getMergeState));
      this.selectMasterField(0, true);
    }
  }

  selectAllRecords(index) {
    let payload = {
      index,
      company: this.selectedCompanyList[index]
    }

    this.store.dispatch(new crudActions.UpdateAllRecords(payload));
  }


  setErrorIndex(index) {
    if (this.errorIndexList.indexOf(index) === -1) {
      this.errorIndexList.push(index);
      this.store.dispatch(new crudActions.UpdateErrorIndex(cloneDeep(this.errorIndexList)));
    }

  }

  setFieldValue(field, companyIndex, errorIndex: number, st: any) {
    if(field.meta && field.meta.dependentPicklist && field.meta.controllerName) {
      return;
    }
    if(st && st.allRecordsFrom !== companyIndex) {
      this.store.dispatch(new crudActions.UpdateAllRecords(null));
    }
    if (companyIndex === 2 && !field.aggregationType) {
      this.setErrorIndex(errorIndex);
      return;
    } else if (companyIndex !== 2) {
      delete field.aggregationType;
      field.selectedCompany = this.selectedCompanyList[companyIndex];
    }
    if (field.aggregationType) {
      delete field.selectedCompany;
    }

    const indx = this.errorIndexList.indexOf(errorIndex);
    if (indx > -1) {
      this.errorIndexList = [... this.errorIndexList];
      this.errorIndexList.splice(indx, 1);
      this.store.dispatch(new crudActions.UpdateErrorIndex(this.errorIndexList));
    }

    const dependentPicklists = this.getDependentPicklists(st.data, field);

    const payload = [{
      fieldName: field.fieldName,
      companyIndex,
      field: field
    }];
    forEach(dependentPicklists, picklist => {
      picklist.selectedCompany = this.selectedCompanyList[companyIndex];
      payload.push({
        field: picklist,
        companyIndex,
        fieldName: picklist.fieldName
      });
    });
    this.store.dispatch(new crudActions.UpdateFieldRecords(payload));
  }

  private getDependentPicklists(allFields: any, field: any) {
    if(field.dataType !== "PICKLIST") {
      return [];
    }
    const selectedDependentPicklists = allFields.filter(f => f.meta && (f.meta.controllerName === field.fieldName));
    let childPicklists = [];
    forEach(selectedDependentPicklists, picklist => {
      childPicklists = union(childPicklists, this.getDependentPicklists(allFields, picklist));
    })
    return union(selectedDependentPicklists, childPicklists);
  }

  showAllFields(indx) {
    if (indx === 0) {
      this.store.dispatch(new crudActions.ShowAllFields())
      this.showBtnIndx = 1;
      this.showMsg = this.i18nService.translate(SHOW_ALL_FIELDS_MSG);
      this.showbtnLabel = this.i18nService.translate(SHOW_DIFF_BTN_MSG);
    } else {
      this.showBtnIndx = 0;
      this.showMsg = this.i18nService.translate(SHOW_DIFFERENT_FIELDS_MSG)
      this.showbtnLabel = this.i18nService.translate(SHOW_ALL_BTN_MSG);
      this.store.dispatch(new crudActions.ShowDifferentFields())
    }
  }

}


