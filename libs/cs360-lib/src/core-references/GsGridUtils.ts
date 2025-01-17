// import {ValueFormatterParams} from "ag-grid-community";
import { ValueFormatterParams } from '@ag-grid-community/core';
import {isEmpty} from 'lodash';

export function hasNullAsValue(params: ValueFormatterParams | any) {
    return !isEmpty(params) && !!params.value && !params.value.hasOwnProperty('v') && params.valueFormatted === 'NULL';
  }