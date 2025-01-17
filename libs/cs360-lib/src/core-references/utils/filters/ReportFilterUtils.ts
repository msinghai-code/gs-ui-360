import { ReportFilter } from '@gs/report/pojos';
import { isEmpty, concat, cloneDeep, isArray } from 'lodash';
//Copied addFilters from core and added to core-references. Changed name of util to avoid confusion
export namespace ReportFilterUtilsCore {
    export function addFilters(filters: ReportFilter = { conditions: [], expression: "" }, additionalFilters: any[], position: string = "LAST"): any {
        const expressionList: any[] = [];
        if (isEmpty(filters)) {
            filters = { conditions: [], expression: "" };
        }
        if (!!additionalFilters && additionalFilters.length) {
            switch (position) {
                case 'LAST':
                    for (const filter of additionalFilters) {
                        // Update conditions
                        if (isArray(filter.conditions)) {
                            filters.conditions = concat((filters.conditions || []), filter.conditions);
                        } else {
                            filters.conditions = concat((filters.conditions || []), [filter.conditions]);
                        }
                        // Add expression to list
                        if (!!filter.expression) {
                            expressionList.push(filter.expression);
                        }
                    }
                    if (expressionList.length) {
                        if (!!filters.expression) {
                            filters.expression = `( ${filters.expression} ) AND ${expressionList.join(' AND ')}`;
                        } else {
                            filters.expression = expressionList.join(' AND ');
                        }
                    }
                    break;
                case 'FIRST':
                    for (const filter of additionalFilters) {
                        // Update conditions
                        filters.conditions = concat([filter.conditions], filters.conditions || []);
                        // Add expression to list
                        if (!!filter.expression) {
                            expressionList.push(filter.expression);
                        }
                    }
                    if (!!filters.expression) {
                        filters.expression = expressionList.length ? `( ${expressionList.join(' AND ')} ) AND ( ${filters.expression} )` : filters.expression;
                    } else {
                        filters.expression = expressionList.length ? expressionList.join(' AND ') : filters.expression;
                    }
                    break;
            }
        }

        return filters;
    }
}