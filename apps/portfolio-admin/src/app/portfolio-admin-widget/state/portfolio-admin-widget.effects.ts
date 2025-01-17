import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { MessageType } from '@gs/gdk/core';
import { DescribeService } from "@gs/gdk/services/describe";
import { HttpProxyService } from "@gs/gdk/services/http";
import { catchError, concatMap, filter, map, mergeMap, switchMap, take, withLatestFrom, tap } from 'rxjs/operators';
import { ObjectDescribed, DescribeObjectError, PortfolioAdminWidgetActionTypes } from './portfolio-admin-widget.actions';
import { PORTFOLIO_WIDGET_MESSAGE_CONSTANTS } from '@gs/portfolio-lib';


@Injectable()
export class PortfolioAdminWidgetEffects {
  constructor(private actions$: Actions, private http: HttpProxyService, private describeService: DescribeService) { }

  @Effect() describeObject$ = this.actions$.pipe(
    ofType(PortfolioAdminWidgetActionTypes.DescribeObject),
    filter((action: any) => action.payload),
    map((action: any) => action.payload),
    mergeMap((host: any) => {
      return this.describeService.getObjectTree(host,
          host.name,
          1,
          null,
          {
            includeChildren: true,
            skipFilter: true,
            sortFieldsByLabel: false,
            maintainDefaultOrder: false,
            showParentIndicator: true,
            resolveMultipleLookups: {resolve: true},
            honorUserContext: false,
            honorCustomLookup: false
          })
        .then(objectList => {
          return new ObjectDescribed({ host: host, data: objectList });
        }, (error) => {
          return new DescribeObjectError({
            message: { value: PORTFOLIO_WIDGET_MESSAGE_CONSTANTS.FAILED_FETCHING_OBJECT_LIST },
            data: { messageType: MessageType.ERROR }
          });
        });
    })
  );
}
