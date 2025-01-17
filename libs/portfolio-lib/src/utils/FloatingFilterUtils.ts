import isEmpty from "lodash/isEmpty";
import cloneDeep from "lodash/cloneDeep";
import {FloatingFilterMap} from "./FloatingFilterMap";

export namespace FloatingFilterUtils {
    export function getFloatingFilterOptionByType(derivedDatatype: string = 'string', options: any = {}) {
        const floatingFilterOperatorMap: any = FloatingFilterUtils.getOperatorMapBySourceOptions(options);
        switch(derivedDatatype.toUpperCase()) {
            case 'STRING':
                return floatingFilterOperatorMap.STRING.filter(op=>['IN', 'NOT_IN'].indexOf(op.value) === -1);
            case 'NUMBER':
                return floatingFilterOperatorMap.NUMBER.filter(op=>['BTW'].indexOf(op.value) === -1);
            case 'DATE':
            case 'DATETIME':
                return floatingFilterOperatorMap.DATE.filter(op=>['BTW'].indexOf(op.value) === -1);
            default:
                return floatingFilterOperatorMap[derivedDatatype.toUpperCase()].filter(op=>['IN', 'NOT_IN'].indexOf(op.value) === -1);
        }
    }

    export function getOperatorMapBySourceOptions(options: any) {
        if(!isEmpty(options.restrictNullsByDatatypes)) {
            return FloatingFilterUtils.restrictNullsBySourceDatatype(options.restrictNullsByDatatypes);
        } else {
            return FloatingFilterUtils.getOperatorMap();
        }
    }

    export function getOperatorMap(): any {
        return cloneDeep(FloatingFilterMap.newOperatorMap);
    }

    /**
     * Filter operator by source + datatypes.
     * @param restrictNullsByDatatypes
     */
    export function restrictNullsBySourceDatatype(restrictNullsByDatatypes: string[]) {
        const operatorMap: any = FloatingFilterUtils.getOperatorMap();
        try {
            let newOperatorMap: any = {};
            // If ALL is present, we need to remove NULL & NOT_NULL for all datatypes.
            if (!!restrictNullsByDatatypes && restrictNullsByDatatypes.indexOf('ALL') >= 0) {
                for (const prop in operatorMap) {
                    if (!!prop && operatorMap.hasOwnProperty(prop)) {
                        newOperatorMap[prop] = operatorMap[prop].filter(o => ['IS_NULL', 'IS_NOT_NULL'].indexOf(o.value) === -1);
                    }
                }
                // If datatypes are present, we need to remove NULL & NOT_NULL for all particular datatypes.
            } else if (!!restrictNullsByDatatypes && restrictNullsByDatatypes.length > 0) {
                for (const prop in operatorMap) {
                    if (!!prop && operatorMap.hasOwnProperty(prop)) {
                        if (restrictNullsByDatatypes.indexOf(prop) >= 0) {
                            newOperatorMap[prop] = operatorMap[prop].filter(o => ['IS_NULL', 'IS_NOT_NULL'].indexOf(o.value) === -1);
                        } else {
                            newOperatorMap[prop] = operatorMap[prop];
                        }
                    }
                }
            } else {
                newOperatorMap = operatorMap;
            }
            return newOperatorMap;
        } catch(e) {
            return operatorMap;
        }
    }
}
