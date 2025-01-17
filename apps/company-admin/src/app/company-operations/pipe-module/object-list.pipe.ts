import { Pipe, PipeTransform, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment-timezone';
import { Formatters } from "@gs/gdk/filter/builder";
import { isUndefined, unescape } from 'lodash';
import * as DOMPurify from 'dompurify';
import {CurrencyService, EnvironmentService } from "@gs/gdk/services/environment";

@Pipe({
  name: 'localeTime',
  pure: false
})
export class MomentDatePipe extends DatePipe implements PipeTransform {
  transform(
    value: string | Date,
    format: string = "shortDate",
    timezone: string = 'Europe/Prague'
  ): string {
    if (!format) format = "shortDate";
    if (!timezone) timezone = 'Europe/Prague';
    if (value) {
      const timezoneOffset = moment(new Date(value)).tz(timezone).format('Z');
      return super.transform(value, format, timezoneOffset);
    }
    return '--';

  }
}


@Pipe({
  name: 'objectcurrency',
  pure: false
})
export class ObjectCurrencyPipe implements PipeTransform {
  constructor(@Inject("envService") private _env: EnvironmentService, private currencyService: CurrencyService) {

  }
  transform(value: string, field: any = '', data: any): string {
    if (!value) {
      return '--';
    }
    const currencyVariant = this.currencyService.currencyDetails.gsCurrencyConfig ? this.currencyService.currencyDetails.gsCurrencyConfig.currencyVariant :
      (window['GS'].gsCurrencyConfig ? window['GS'].gsCurrencyConfig.currencyVariant : '');
    let currencySymbol = this.currencyService.currencySymbol;
    if (currencyVariant === "MULTI_CURRENCY") {
      currencySymbol = data.currencyIsoCode;
    }
    else if (currencyVariant === "SINGLE_CURRENCY") {
      currencySymbol = this.currencyService.currencyDetails.gsCurrencyConfig.currencyIsoCode;
    } else {
      if (field && field.meta && field.meta.properties) {
        currencySymbol = field.meta.properties.CURRENCY_SYMBOL;
      } else {
        currencySymbol = this.currencyService.currencySymbol;
      }
    }
    const decimals = field && field.meta && !isUndefined(field.meta.decimalPlaces) ? field.meta.decimalPlaces : this._env.getConfig().decimals;
    return `${currencySymbol?currencySymbol:''} ${Formatters.Number.numberFormatter(value, decimals)}`;
  }
}

@Pipe({
  name: 'objectRTA',
  pure: false
})
export class ObjectRTAPipe implements PipeTransform {
  constructor(@Inject("envService") private _env: EnvironmentService) {

  }
  transform(value: string, field: any = '', data: any): string {
    if (!value) {
      return '--';
    }
    return DOMPurify.sanitize(unescape(value), {
      ALLOWED_TAGS: [
      ],
      ALLOWED_ATTR: ['href', 'title']
    });
  }
}

@Pipe({
  name: 'objectNumber',
  pure: false
})
export class ObjectNumberPipe implements PipeTransform {
  constructor(@Inject("envService") private _env: EnvironmentService) {

  }
  transform(value: string, field: any = '', data: any): string {
    if (!value) {
      return '--';
    }
    const decimals = field && field.meta && !isUndefined(field.meta.decimalPlaces) ? field.meta.decimalPlaces : this._env.uiEnvironment.decimals;
    return Formatters.Number.numberFormatter(value, decimals);
  }
}
