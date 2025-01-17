import { AppInjector } from "@gs/report/utils";
import { NzI18nService } from "@gs/ng-horizon/i18n";
import { concat, cloneDeep } from "lodash";
import { ReportFilterMap } from "./filter-map";
import { TranslocoService } from '@ngneat/transloco';

export namespace operatorTranslation {
  export function getOperatorMap(transloco?: TranslocoService): any {
    const i18nService = transloco || AppInjector.get(NzI18nService);
    for (const obj in ReportFilterMap.newOperatorMap) {
      ReportFilterMap.newOperatorMap[obj].forEach((ob) => {
        ob.label = i18nService.translate(ob.label);
      });
    }
    return cloneDeep(ReportFilterMap.newOperatorMap);
  }

  export function getDateLiterals(): any[] {
    const tService = AppInjector.get(NzI18nService);
    ReportFilterMap.calenderDateLiterals.forEach((filter) =>
      dateTranslation(filter, tService)
    );
    ReportFilterMap.fiscalDateLiterals.forEach((filter) =>
      dateTranslation(filter, tService)
    );
    return concat(
      ReportFilterMap.calenderDateLiterals,
      ReportFilterMap.fiscalDateLiterals
    );
  }

  function dateTranslation(filter, tService) {
    filter.label = tService.translate(filter.label);
    filter.options.forEach((filter_date) => {
      filter_date.label = tService.translate(filter_date.label);
    });
  }
}
