import { ICellRendererParams, ValueFormatterParams } from "@ag-grid-community/core";
import { DataTypesMap, DataTypes, DEFAULT_STRING_FILTER_OPTION, DEFAULT_NUMBER_FILTER_OPTION, DEFAULT_DATE_FILTER_OPTION, UNSEARCHABLE_COLUMNS_DATATYPES, FILTER_OPTIONS_VALUES } from "./constants";
import { isUndefined, find, includes, unescape, escape, get } from "lodash";
import { convertToMomentJSDateFormat, AppInjector } from "@gs/core";
import { isValidHTMLTagFromString } from "@gs/gdk/utils/common";
import { ALLOWED_HTML_TAG_FOR_STRING_DTS } from '@gs/gdk/grid';
import {
  DateFloatingFilterComponent,
  NumberFloatingFilterComponent,
  TextFloatingFilterComponent
} from "@gs/gdk/grid";
import {Formatters} from "@gs/gdk/filter/builder";
import { DateUtils } from "@gs/gdk/utils/date";
import {operatorMap} from "./operator";
import * as moment from 'moment';
import * as DOMPurify from 'dompurify';
import { CurrencyService, EnvironmentService } from "@gs/gdk/services/environment";
import { NzI18nService } from "@gs/ng-horizon/i18n";
import {HybridHelper} from "@gs/gdk/utils/hybrid";

export class CompanyGridUtils {
  static setCustomCellRenderer(params: ICellRendererParams, fields: any[], _env?: any) {
    const tempParams:any = params;
    if (tempParams.colDef && tempParams.colDef.fieldName === "Name") {
      if(!params.data) {
        return;
      }
      const name = get(params, 'data.Name');
      const nodesList = isValidHTMLTagFromString(name || '', ALLOWED_HTML_TAG_FOR_STRING_DTS.join(', '));
      if (name && nodesList.length) {
        params.data.Name = escape(name);
      }
      let c360Url;
      const isHybrid = (window.urlParams || {})['isHybrid'] + '' === 'true';
      if (isHybrid) {
        const hybridHostURL = (window.urlParams || {})['hostUrl'];
        c360Url = hybridHostURL + "#customersuccess360?cid=" + params.data.Gsid;
        // const isInConsole = HybridHelper.isInConsole();
        const isLightening = HybridHelper.isLightningEnabled();
        
        if(isLightening) {
          c360Url = HybridHelper.getURLForLightning(c360Url);
        } 
      } else {
        c360Url = "/v1/ui/customersuccess360?cid=" + params.data.Gsid;
      }
      return '<a target="_blank" href="'+ c360Url +'">' + params.data.Name +'</a>';
    } else if(tempParams.colDef.fieldName !== "Name" && tempParams.colDef.dataType === "STRING" && tempParams.colDef.mappings){
      return escape(params.valueFormatted);
    } else {
      const html = params.valueFormatted;
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const anchorElement = doc.querySelector('a');
      if (anchorElement) {
        anchorElement.setAttribute('target', '_blank');
        const modifiedValue = new XMLSerializer().serializeToString(doc);
        return modifiedValue;
      }
      return params.valueFormatted;
    }
  }
  
  static formatNumberByLocale(value: number, decimals: number, config: any) {
    const number: number = typeof value === "string" ? parseFloat(value) : value;
    return Formatters.Number.numberFormatter(number, decimals);
  }
  
  static getValueFormatter(params: ValueFormatterParams, allFields: any[], env: EnvironmentService, cs: CurrencyService) {
    const columnInfo = find(allFields, field => field.fieldName === params.colDef.colId);
    const dataType = columnInfo.dataType.toUpperCase();
    const envConfig = env.uiEnvironment;
    const decimals = isUndefined(columnInfo.meta.decimalPlaces) ? envConfig.decimals : columnInfo.meta.decimalPlaces;
    switch (true) {
    case (dataType === DataTypes.PERCENTAGE || DataTypesMap[dataType] === DataTypes.PERCENTAGE):
      return params.value !== null ? this.formatNumberByLocale(params.value, decimals, envConfig) + "%" : params.value;
    case (dataType === DataTypes.CURRENCY || DataTypesMap[dataType] === DataTypes.CURRENCY):
      if(params.value !== null) {
        const envCurrencyConfig = cs.currencyDetails;
        const currencyVariant =  envCurrencyConfig ? envCurrencyConfig.gsCurrencyConfig ? envCurrencyConfig.gsCurrencyConfig.currencyVariant : '' : '';
        let currencySymbol;
        if (currencyVariant === "MULTI_CURRENCY") {
          currencySymbol = params.data ? params.data.CurrencyIsoCode ? params.data.CurrencyIsoCode : envCurrencyConfig.gsCurrencyConfig.currencyIsoCode : envCurrencyConfig.gsCurrencyConfig.currencyIsoCode;
        } else if (currencyVariant === "SINGLE_CURRENCY") {
          currencySymbol = envCurrencyConfig.gsCurrencyConfig.currencyIsoCode;
        } else {
          if (columnInfo && columnInfo.meta && columnInfo.meta.properties) {
            currencySymbol = columnInfo.meta.properties.CURRENCY_UNICODE;
          } else {
            currencySymbol = envCurrencyConfig.gsCurrencyConfig.currencyIsoSymbol;
          }
        }
        return currencySymbol ? currencySymbol + ' ' + this.formatNumberByLocale(params.value, decimals, envConfig) : this.formatNumberByLocale(params.value, decimals, envConfig);
      } else {
        return null;
      }
    case (dataType === DataTypes.NUMBER || DataTypesMap[dataType] === DataTypes.NUMBER):
        return params.value !==null ? this.formatNumberByLocale(params.value, decimals, envConfig) : null;
    case (dataType === DataTypes.DATE || DataTypesMap[dataType] === DataTypes.DATE):
    case (dataType === DataTypes.DATETIME || DataTypesMap[dataType] === DataTypes.DATETIME):
        if(params.value && (envConfig.dateFormat || envConfig.dateTimeFormat)){
          const momentFormat = columnInfo.dataType === DataTypes.DATE ? convertToMomentJSDateFormat(envConfig.dateFormat) : convertToMomentJSDateFormat(envConfig.dateTimeFormat);
          return dataType === DataTypes.DATETIME ? DateUtils.utc2Local(
                                                    params.value,
                                                    momentFormat,
                                                    envConfig.timeZoneKey) + '' : 
                                                    moment(params.value).format(momentFormat);
        }
        return params.value;
    case (dataType === DataTypes.URL || DataTypesMap[dataType] === DataTypes.URL):
      const url = params.value ? /^(http)(s?):\/\//i.test(params.value) ? params.value : 'http://' + params.value : '';
      return !!url ? `<a href="${url}" target="_blank">${params.value}</a>` : '';
      case (dataType === DataTypes.MULTISELECTDROPDOWNLIST || dataType === DataTypes.PICKLIST): {
        if(params.data) {
            return params.data[params.colDef.colId + "_PicklistLabel"] || params.value;
        }
        return params.value;
    }
    case (dataType === DataTypes.RICHTEXTAREA || dataType === DataTypes.RICHTEXTAREA): {
      if(params.value) {
        const GS = env.gsObject;
        if(GS.featureFlags['CR360_TEXT_DATA_DECODING_DONE']){
          return DOMPurify.sanitize(params.value, {
              ALLOWED_TAGS: [ 'strong', 'u', 'a',
              ],
              ALLOWED_ATTR: ['href', 'title', 'target']
            });
          } else {
            return DOMPurify.sanitize(unescape(params.value), {
              ALLOWED_TAGS: [ 'strong', 'u', 'a',
              ],
              ALLOWED_ATTR: ['href', 'title', 'target']
            });
          }
      }
      return params.value;
    }
    default:
        return params.value;
    }
  }

  static getUrlTooltip(params: any) {
    return params.value;
  }

  static setFloatingFilterComponent(dataType: string, columnDef: any) {
    const tservice =  AppInjector.get(NzI18nService);
    if(includes(UNSEARCHABLE_COLUMNS_DATATYPES, columnDef.dataType)) {
      return null;
    }
    const derivedDatatype = DataTypesMap[dataType.toUpperCase()];

    if(!derivedDatatype) {
      return null;
    }
   
    const filterOptions = operatorMap[derivedDatatype.toUpperCase()] || [];
 
    switch (derivedDatatype.toUpperCase()) {
     
      case DataTypes.STRING:
       
        return {
          floatingFilterComponent: TextFloatingFilterComponent,
          floatingFilterComponentParams: {
            suppressFilterButton: true,
            placeholder: '',
            filterOptions: (filterOptions).map((operatorObj) => {
              
              return {value: operatorObj.value, label: tservice.translate(operatorObj.label), default: operatorObj.value === DEFAULT_STRING_FILTER_OPTION} || [];
            })
            
          },
          filterParams: {
            filterOptions: (filterOptions).map((operatorObj) => {
                return {displayKey: operatorObj.value, displayName: operatorObj.value, predicate: () => true};
            })
          }
        };
      case DataTypes.NUMBER:

        const numberFilterOptions = filterOptions.filter( option =>  option.value !== FILTER_OPTIONS_VALUES.BTW);
        return {
          floatingFilterComponent: NumberFloatingFilterComponent,
          floatingFilterComponentParams: {
            suppressFilterButton: true,
            placeholder: '',
            filterOptions: (numberFilterOptions).map((operatorObj) => {
              return {value: operatorObj.value, label: tservice.translate(operatorObj.label), default: operatorObj.value === DEFAULT_NUMBER_FILTER_OPTION} || [];
            })
          },
          filterParams: {
            filterOptions: (numberFilterOptions).map((operatorObj) => {
              return {displayKey: operatorObj.value, displayName: operatorObj.value, predicate: () => true} || [];
            })
          }
        };
      case DataTypes.DATE:
      case DataTypes.DATETIME:
        const dateFilterOptions = filterOptions.filter( option => option.value !== FILTER_OPTIONS_VALUES.BTW);
        return {
          floatingFilterComponent: DateFloatingFilterComponent,
          floatingFilterComponentParams: {
            suppressFilterButton: true,
            placeholder: '',
            filterOptions: (dateFilterOptions).map((operatorObj) => {
              return {value: operatorObj.value, label: tservice.translate(operatorObj.label), default: operatorObj.value === DEFAULT_DATE_FILTER_OPTION} || [];
            })
          },
          filterParams: {
            filterOptions: (dateFilterOptions).map((operatorObj) => {
              return {displayKey: operatorObj.value, displayName: operatorObj.value, predicate: () => true} || [];
            })
          }
        };
      default: return null;
    }
  }
}


