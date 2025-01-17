import isEmpty from "lodash/isEmpty";
import concat from "lodash/concat";
import {PortfolioGSField, SourceDetails} from "../pojos/portfolio-interfaces";
import {FieldUtils} from "./FieldUtils";
import {FilterMap} from "./FilterMap";

export namespace GridUtils {
    export function getSortOrder(orderField: PortfolioGSField[], fields: PortfolioGSField[], moduleConfig?: any, sourceDetails?: SourceDetails): any[] {
        orderField = getSortField(orderField, fields, moduleConfig, sourceDetails, false);
        return GridUtils.getSortModel(orderField);
    }

    export function getSortModel(fields: PortfolioGSField[], multiSort: boolean = false): {colId: string, sort: string}[] {
        const sortModel: any[] = fields.map((field: PortfolioGSField)=>{
            return {
                colId: field.fieldAlias,
                sort: GridUtils.evaluateSortOrder(field)
            };
        });
        return multiSort ? sortModel: sortModel.filter((s, i)=>i===0);
    }

    export function evaluateSortOrder(fieldInformation: PortfolioGSField) {
        if (fieldInformation.hasOwnProperty('sortOrder') && !!fieldInformation.sortOrder) {
            return fieldInformation.sortOrder.toLowerCase() || GridUtils.getDefaultSortOrder(fieldInformation).toLowerCase();
        } else if (fieldInformation.hasOwnProperty('orderByInfo') && !!fieldInformation.orderByInfo && !!fieldInformation.orderByInfo.order) {
            return fieldInformation.orderByInfo.order.toLowerCase();
        }
        return GridUtils.getDefaultSortOrder(fieldInformation);
    }

    export function getDefaultSortOrder(field: PortfolioGSField): string {
        const datatype: string = field.dataType.toUpperCase();
        return FilterMap.DEFAULT_SORT_ORDER_BY_DTS[datatype] || 'ASC';
    }

    export function getDefaultSortingOrder(field: PortfolioGSField): string[] {
        const datatype: string = field.dataType.toUpperCase();
        return FilterMap.DEFAULT_SORTING_ORDER_BY_DTS[datatype] || ["asc", "desc"];
    }

    export function getSortField(orderField: PortfolioGSField[], fields: PortfolioGSField[], moduleConfig?: any, sourceDetails?: SourceDetails, checkRowGroupInAllFields: boolean = true) {
        if(!!orderField && orderField.length) {
            return orderField;
        } else if(!!fields && fields.length) {
            const sortableFields: PortfolioGSField[] = GridUtils.getSortableFields(fields, moduleConfig, sourceDetails);
            let orderableField: PortfolioGSField[];
            /**
             * If row group is enabled and is sortable, default sorting will be on row grouped element
             * Else Flat Report = 1st sortable show field
             *      Aggregated Report = 1st sortable group field
             *
             * checkRowGroupInAllFields => false => showing sort in grid
             */
            const checkableFields = checkRowGroupInAllFields ? fields : sortableFields;
            const rowGrouped = GridUtils.isRowGroupEnabled(checkableFields);
            if(rowGrouped) {
                orderableField = GridUtils.getRowGroupedFields(sortableFields);
            } else {
                orderableField = GridUtils.getOrderableField(sortableFields);
            }
            if(orderableField) {
                return orderableField;
            }
        }
    }

    export function isRowGroupEnabled(fields: PortfolioGSField[]): boolean {
        if (!isEmpty(fields)) {
            return fields.some((field: PortfolioGSField) => {
                return FieldUtils.isFieldRowGrouped(field);
            });
        }
    }

    export function getRowGroupedFields(fields: Array<PortfolioGSField>) {
        return fields.filter((field) => {
            return field.rowGrouped;
        });
    }

    export function getOrderableField(fields: PortfolioGSField[]): PortfolioGSField[] {
        return fields.filter((field: PortfolioGSField) => {
            return !field.pivoted;
        });
    }

    export function isPivotEnabled(fields: PortfolioGSField[]): boolean {
        if (!isEmpty(fields)) {
            return fields.some((field: PortfolioGSField) => {
                return FieldUtils.isFieldPivoted(field);
            });
        }
    }

    export function getSortableFields(fields: PortfolioGSField[], moduleConfig: any, sourceDetails: SourceDetails): PortfolioGSField[] {
        const restrictedFieldForSorting: string[] = GridUtils.getFeatureEnableStatusByKey(moduleConfig, sourceDetails, 'RESTRICTED_FIELDS_FOR_SORTING');
        // If Agg/summerization is applied, check for derived datatypes.
        return fields.filter((field: PortfolioGSField) => {
            // Aliased field is not sortable
            if(!isFieldAliased(field)) {
                if(FieldUtils.hasAggregation(field) || FieldUtils.hasSummerization(field)) {
                    const derivedColDatatype: string = FieldUtils.getFieldDerivedDatatype(field).toUpperCase();
                    const sortable: boolean = field.sortable || FilterMap.systemToPrimitiveDatatypeSortableMap[derivedColDatatype];
                    return !isEmpty(restrictedFieldForSorting) && restrictedFieldForSorting.indexOf(derivedColDatatype) >= 0 ? false: sortable;
                } else {
                    return !isEmpty(restrictedFieldForSorting) && restrictedFieldForSorting.indexOf(field.dataType.toUpperCase()) >= 0 ? false: field.sortable;
                }
            } else {
                return false;
            }
        });
    }

    export function isFieldAliased(field) {
        return field.dataLabels && field.dataLabels.length > 0;
    }

    export function getFeatureEnableStatusByKey(moduleConfig: any, sourceDetails: SourceDetails, key: string) {
        const featureEnablementMap: any = moduleConfig.FEATURE_ENABLEMENT;
        const features = featureEnablementMap[sourceDetails.dataStoreType || sourceDetails.connectionType];
        if(!isEmpty(features)) {
            return features[key];
        }
    }

    export function getReportInfo(reportState: any): any {
        const fields: PortfolioGSField[] = GridUtils.getReportFields(reportState);
        /**
         *  Case 1: Pivot and Row Grouping will not be applicable for Charts.
         *  Case 2: Alias wont be honoured for Pivoted reports.
         */
        if(GridUtils.isPivotEnabled(fields)) {
            return {
                messages: [
                    'Pivot and Row Grouping will not be applicable for Charts',
                    'Aliases wont be honored for Pivoted Report'
                ]
            };
        } else if(GridUtils.isRowGroupEnabled(fields)) {
            return {
                messages: ['Pivot and Row Grouping will not be applicable for Charts']
            }
        }
    }

    export function getReportFields(reportState: any) {
        return concat(reportState.group, reportState.select);
    }

    export function parsedFilters(filters: any): any[] {
        const filterList = [];
        let parsedValue: any;
        if (!isEmpty(filters)) {
            for (const prop in filters) {
                if (!isEmpty(filters[prop]) && filters.hasOwnProperty(prop)) {
                    switch (filters[prop].filterType.toUpperCase()) {
                        case 'NUMBER':
                        case 'CURRENCY':
                        case 'PERCENTAGE':
                            parsedValue = filters[prop].filter;
                            filterList.push(getParsedFilter(prop, filters[prop].type, parsedValue));
                            break;
                        case 'STRING':
                        case 'TEXT':
                            parsedValue = filters[prop].filter;
                            filterList.push(getParsedFilter(prop, filters[prop].type, parsedValue));
                            break;
                        case 'DATE':
                        case 'DATETIME':
                            parsedValue = filters[prop].dateFrom;
                            filterList.push(getParsedFilter(prop, filters[prop].type, parsedValue));
                            break;
                    }
                }
            }
        }

        return filterList;
    }

    export function getParsedFilter(field: string, operator: string, value: any): any {
        return {
            field,
            operator,
            value
        };
    }

    export function isComplexFiscalConfigured(fields: PortfolioGSField[]): boolean {
        const field: PortfolioGSField = GridUtils.getFieldWithComplexFiscalConfigured(fields);
        return !isEmpty(field);
    }

    export function getFieldWithComplexFiscalConfigured(fields: PortfolioGSField[], returnList: boolean = false): PortfolioGSField | PortfolioGSField[] | any {
        return returnList ? fields.filter(f => FieldUtils.isComplexFiscalConfigured(f)): fields.find(f => FieldUtils.isComplexFiscalConfigured(f));
    }
}
