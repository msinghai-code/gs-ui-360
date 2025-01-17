import { MergeActions, MergeActionsUnion } from './merge.actions';
import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import { zipWith, find, findIndex, forEach, map, differenceBy, filter, cloneDeep } from 'lodash';
import * as $ from 'jquery';

const nextModule = {
  company: "scorecard",
  scorecard: "timeline",
  timeline: null
}

const prevModule = {
  company: null,
  scorecard: "company",
  timeline: "scorecard"
}

export interface MasterRecord {
  masterRecord: string;
  mergeRecords: Array<string>;
  masterDataAlterations: any;
  masterDataAggregation: any;
}

export interface CompanyObject {
  Name: string;
  Gsid: string;
}

export interface MergeState {
  loading: boolean;
  selectedCompanyList: Array<string>
  data: Array<any>;
  companyObj1: CompanyObject;
  companyObj2: CompanyObject;
  postquery: MasterRecord;
  activeModule: string;
  nextModule: string;
  prevModule: string;
  errorIndex: Array<any>;
  redirectLink: string;
  companiesList: Array<any>;
  fromCompanyList: boolean;
  route: number;
  companiesListComp1: Array<any>;
  companiesListComp2: Array<any>;
  allowMerge: number;
  allRecordsFrom: number;
  mergeSuccess?: boolean;
}

const EXCLUDE_FIELD_LIST = [{ fieldName: "CreatedBy" }, { fieldName: "CreatedDate" }, { fieldName: "CurrentScore" }, { fieldName: "Gsid" },
{ fieldName: "ModifiedBy" }, { fieldName: "ModifiedDate" }, { fieldName: "Nps" }, { fieldName: "OverallScoreComments" },
{ fieldName: "PreviousScore" }, { fieldName: "ScorecardId" }, { fieldName: "Trend" }];

export const initialState: MergeState = {
  loading: false,
  selectedCompanyList: [],
  data: [],
  companyObj1: null,
  companyObj2: null,
  postquery: {
    "masterRecord": "",
    "mergeRecords": [],
    "masterDataAlterations": {},
    "masterDataAggregation": {}
  },
  activeModule: "company",
  nextModule: "scorecard",
  prevModule: "",
  errorIndex: [],
  redirectLink: "",
  companiesList: [],
  fromCompanyList: false,
  route: 0,
  companiesListComp1: [],
  companiesListComp2: [],
  allowMerge: 0,
  allRecordsFrom: null
};


export function reducer(state = initialState, action: MergeActionsUnion) {
  switch (action.type) {
    case MergeActions.SET_ACTIVE_MODULE: {
      return {
        ...state,
        activeModule: action.payload,
        prevModule: prevModule[action.payload],
        nextModule: nextModule[action.payload],
      }
    }

    case MergeActions.SET_INITIAL_STATE: {
      state = initialState;
      return state;
    }

    case MergeActions.SET_COMPANY_LIST: {
      return {
        ...state,
        loading: true,
        selectedCompanyList: action.payload
      }
    }

    case MergeActions.SET_ROUTE_PATH: {
      return {
        ...state,
        route: action.payload
      }
    }

    case MergeActions.SET_REDIRECT_LINK: {
      return {
        ...state,
        loading: false,
        redirectLink: action.payload && atob(action.payload) || ''
      }
    }

    case MergeActions.LOAD_COMPANY_LIST:
    case MergeActions.DESCRIBE_OBJECT:
    case MergeActions.MERGE_COMPANY: {
      return {
        ...state,
        loading: true
      };
    }

    case MergeActions.LOAD_COMPANY_DATA: {
      return {
        ...state,
        loading: true,
        data: []
      };
    }

    case MergeActions.LOAD_COMPANY_LIST_SUCCESS: {
      const companiesList = cloneDeep(action.payload.records);
      let companiesListComp1 = [...companiesList];
      let companiesListComp2 = [...companiesList];
      let companyObj1 = cloneDeep(state.companyObj1);
      let companyObj2 = cloneDeep(state.companyObj2);
      
      if(companyObj1) {
        companiesListComp2 = filter(companiesList, item => item.Gsid !== companyObj1.Gsid);
      }
      if(companyObj2) {
        companiesListComp1 = filter(companiesList, item => item.Gsid !== companyObj2.Gsid);
      }

      let obj = {
        companiesList,
        fromCompanyList: true,
        companiesListComp1,
        companiesListComp2
      }
      return {
        ...state,
        loading: false,
        ...obj
      };
    }
    case MergeActions.LOAD_COMPANY_DATA_SUCCESS: {
      let allowMerge = 1;
      let companyMap = {};
      let companyList = cloneDeep(state.selectedCompanyList);

      forEach(action.payload, (fieldArr) => {
        let Gsid: any = find(fieldArr, { fieldName: 'Gsid' });
        companyMap[Gsid.value] = fieldArr;
      });

      let company1 = companyMap[companyList[0]];
      let company2 = companyMap[companyList[1]];

      let currencyIsoCode = '';
      const currencyField = find(company1, { fieldName: 'CurrencyIsoCode' });
      if (currencyField) {
        currencyIsoCode = currencyField['value'];
      }

      let masterRecord = state.postquery.masterRecord;
      let data = zipWith(company1, company2, (c1: any, c2: any) => {
        let c1Value = c1.value;
        let c2Value = c2.value;
        let showField = c1Value !== c2Value;
      
        if (c1.dataType === "RICHTEXTAREA") {
          try {
            c1Value = c1Value && $(c1Value).text();
            c2Value = c2Value && $(c2Value).text();
          } catch (e) {
          }
        }
        if (c1.fieldName === 'CurrencyIsoCode') {
          allowMerge = showField ? 2 : 1;
        }
        return { ...c1, c1_value: c1Value, c2_value: c2Value, c1_checked: true, c2_checked: false, c3_checked: false, selectedCompany: masterRecord, showField, currencyIsoCode };
      });
      let nameItem: any = find(data, { fieldName: 'Name' as any });

      let stateObject = {
        data: differenceBy(data, EXCLUDE_FIELD_LIST, 'fieldName'),
        companyObj1: { Name: nameItem.c1_value, Gsid: companyList[0] },
        companyObj2: { Name: nameItem.c2_value, Gsid: companyList[1] }
      } as any;
      if (!state.fromCompanyList) {
        stateObject.companiesList = [stateObject.companyObj1, stateObject.companyObj2];
        stateObject.companiesListComp1 = [stateObject.companyObj1];
        stateObject.companiesListComp2 = [stateObject.companyObj2];
      }
      return {
        ...state,
        allowMerge,
        ...stateObject
      };
    }

    case MergeActions.DESCRIBE_OBJECT_SUCCESS: {
      let fields = action.payload && action.payload.company && action.payload.company.fields;
      let readonlyList = filter(fields, field => field.meta && field.meta.formulaField && field.meta.readOnly);
      let excludeFieldList = map(readonlyList, (field: any) => { return { fieldName: field.fieldName } });
      let data = differenceBy(cloneDeep(state.data), excludeFieldList, 'fieldName');
      forEach(data, (item: any) => {
        let field = find(fields, field => field.fieldName === item.fieldName);
        if (field.dataType === "CURRENCY" || field.dataType === "PICKLIST") {
          item.meta = field.meta;
        }
        if (field && field.options) {
          let value1 = item.c1_value;
          let value2 = item.c2_value;
          let label1 = "";
          let label2 = "";
          if (field.dataType === "MULTISELECTDROPDOWNLIST") {
            let multiLabels1 = value1 && value1.split(";") || [];
            let multiLabels2 = value2 && value2.split(";") || [];
            if (multiLabels1.length > 0) {
              forEach(multiLabels1, (item: any, idx: number) => {
                let val = find(field.options, opt => opt.value === item);
                if (idx === 0) {
                  label1 += val && val.label || '';
                } else {
                  label1 += val && val.label ? `; ${val && val.label}` : '';
                }
              });
            }

            if (multiLabels2.length > 0) {
              forEach(multiLabels2, (item: any, idx: number) => {
                let val = find(field.options, opt => opt.value === item);
                if (idx === 0) {
                  label2 += val && val.label || '';
                } else {
                  label2 += val && val.label ? `; ${val && val.label}` : '';
                }
              });
            }
          } else {
            if (field.fieldName.toString().toLowerCase() === "currencyisocode")
              return;
            let optionValue1 = find(field.options, opt => opt.value === value1);
            let optionValue2 = find(field.options, opt => opt.value === value2);
            label1 = optionValue1 && optionValue1.label;
            label2 = optionValue2 && optionValue2.label
          }
          item.c1_value = label1 || item.c1_value;
          item.c2_value = label2 || item.c2_value;
        }
      });
      return {
        ...state,
        loading: false,
        data
      };
    }
    case MergeActions.SET_MASTER_RECORD: {
      let postquery = cloneDeep(state.postquery);
      if (action.payload.checkIfNeedsToBeUpdated) {
        postquery.masterRecord = postquery.masterRecord ? postquery.masterRecord : action.payload.masterRecord;
        postquery.mergeRecords = postquery.mergeRecords.length ? postquery.mergeRecords : action.payload.mergeRecord;
      } else {
        postquery.masterRecord = action.payload.masterRecord;
        postquery.mergeRecords = action.payload.mergeRecord;
      }
      return {
        ...state,
        postquery
      };
    }
    case MergeActions.UPDATE_FIELD_RECORD: {
      const data = cloneDeep(state.data);
      action.payload.forEach(payload => {
        const fieldName = payload.fieldName;
        const companyIndex = payload.companyIndex;
        const field = payload.field;
        const recordIndex = findIndex(data, (o) => { return o.fieldName === fieldName; });
        data[recordIndex].c1_checked = companyIndex === 0;
        data[recordIndex].c2_checked = companyIndex === 1;
        data[recordIndex].c3_checked = companyIndex === 2;
        if (field) {
          if (field.aggregationType)
            data[recordIndex].aggregationType = field.aggregationType;
          data[recordIndex].selectedCompany = field.selectedCompany;
        }
      })
      return {
        ...state,
        data
      };
    }

    case MergeActions.UPDATE_ALL_RECORD: {
      let allRecordsFrom;
      if(!action.payload) {
        allRecordsFrom = null;
        return {
          ...state,
          allRecordsFrom
        };
      }
      allRecordsFrom = action.payload.index;
      const data = cloneDeep(state.data);
      forEach(data, (field) => {
        field.selectedCompany = action.payload.company;
        field.c1_checked = action.payload.index === 0;
        field.c2_checked = action.payload.index === 1;
        field.c3_checked = false;
      });
      return {
        ...state,
        allRecordsFrom,
        data
      };
    }

    case MergeActions.SHOW_ALL_FIELDS: {
      let data = cloneDeep(state.data);
      data = map(data, (field) => {
        field.showField = true;
        return field;
      });
      return {
        ...state,
        data
      };
    }
    case MergeActions.SHOW_DIFF_FIELDS: {
      let data = cloneDeep(state.data);
      data = map(data, (field) => {
        let showField = field.c1_value !== field.c2_value;
        field.showField = showField;
        return field;
      });
      return {
        ...state,
        data
      };
    }

    case MergeActions.UPDATE_DD_LIST: {
      const companiesList = cloneDeep(state.companiesList);
      let companiesListComp1 = [...companiesList];
      let companiesListComp2 = [...companiesList];
      let companyObj1 = cloneDeep(state.companyObj1);
      let companyObj2 = cloneDeep(state.companyObj2);
      switch (action.payload.companayIdx) {
        case 0:

          companiesListComp2 = filter(companiesList, item => { return item.Gsid !== action.payload.gsid; });
          const obj1 = find(companiesList, item => { return item.Gsid === action.payload.gsid; });
          if (obj1) {
            companyObj1 = {
              Name: obj1.Name,
              Gsid: obj1.Gsid
            }
          }
          break;
        case 1:
          companiesListComp1 = filter(companiesList, item => { return item.Gsid !== action.payload.gsid; });
          const obj2 = find(companiesList, item => { return item.Gsid === action.payload.gsid; });
          if (obj2) {
            companyObj2 = {
              Name: obj2.Name,
              Gsid: obj2.Gsid
            }
          }
          break;
      }

      return {
        ...state,
        companiesListComp1,
        companiesListComp2,
        companyObj1,
        companyObj2
      };
    }

    case MergeActions.MERGE_COMPANY_SUCCESS:
    case MergeActions.MERGE_COMPANY_FAILURE: {
      return {
        ...state,
        loading: true,
        mergeSuccess: true
      };
    }

    case MergeActions.LOAD_COMPANY_LIST_FAIL:
    case MergeActions.LOAD_COMPANY_DATA_FAIL:
    case MergeActions.DESCRIBE_OBJECT_FAILURE: {
      return {
        ...state,
        loading: false
      }
    }

    case MergeActions.UPDATE_ERROR_INDEX: {
      const errorIndex = action.payload
      return {
        ...state,
        errorIndex
      }
    }
    default: {
      return {
        ...state
      };
    }
  }
}

export interface MergeCompanyState {
  mergeState: MergeState;
}

export const reducers: ActionReducerMap<MergeCompanyState> = {
  mergeState: reducer
};

export const getAppState = createFeatureSelector<MergeCompanyState>(
  'mergecompany'
);
