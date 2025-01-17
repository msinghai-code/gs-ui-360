import { Injectable } from '@angular/core';
import { updateFiltersBasedOnIsApplicable } from '@gs/gdk/filter/global';
import { MessageType } from '@gs/gdk/core';
import { HttpProxyService } from "@gs/gdk/services/http";
import { PortfolioEditRequestInfo, PortfolioConfig, PortfolioGridState, PortfolioScopes } from '@gs/portfolio-lib';
import { PORTFOLIO_WIDGET_CONSTANTS, PORTFOLIO_APIUrls } from '@gs/portfolio-lib';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PortfolioCsmWidgetFacade } from './state/portfolio-csm-widget.facade';

interface GridStateForObject {
    gridState: PortfolioGridState;
    objectName: string;
}

@Injectable({
    providedIn: 'root'
})

export class PortfolioCsmWidgetService {


    private gridStateSubject = new Subject<GridStateForObject>();
    private portfolioDataSubject = new Subject<any>();
    private requestSource: string;

    public portfolioDataObservable = this.portfolioDataSubject.asObservable();

    constructor(private http: HttpProxyService, private portfolioCsmWidgetFacade: PortfolioCsmWidgetFacade) {
        this.gridStateSubject.subscribe(info => {
            if(!this.requestSource.includes("DASHBOARD")) {
                info.gridState.globalFilter = updateFiltersBasedOnIsApplicable(info.gridState.globalFilter || {conditions: [], expression: ""});
            }
            this.getPortfolioGridData(info).subscribe(data => {
                this.portfolioDataSubject.next(data);
            })
        })
    }

    getInitialGridState(gridState?: PortfolioGridState): PortfolioGridState {
        return {...PORTFOLIO_WIDGET_CONSTANTS.INITIAL_GRID_STATE,
            whereFilters: (gridState && gridState.whereFilters) || [],
            orderByFields: (gridState && gridState.orderByFields) || [],
            pageSize: (gridState && gridState.pageSize) || 25
        };
    }

    setRequestSource(source: string) {
        this.requestSource = source;
    }

    getRequestSource(): string {
        return this.requestSource;
    }

    setGridState(gridState: PortfolioGridState, objectName: string) {
        this.gridStateSubject.next({gridState, objectName});
    }

    private getPortfolioGridData(info: GridStateForObject) {
        return this.http.post(PORTFOLIO_APIUrls.GET_PORTFOLIO_DATA(info.objectName), info.gridState).pipe(map(response => {
            if(response.success) {
                return response.data;
            } else {
                return response;
            }
        })
        );
    }

    updatePortfolioRecord(objectName: string, info: PortfolioEditRequestInfo) {
        return this.http.put(PORTFOLIO_APIUrls.UPDATE_PORTFOLIO_RECORD(objectName), info).pipe(map(response => {
            if(response.success) {
                return response.data;
            } else {
                // this.portfolioCsmWidgetFacade.showToastMessage(response.error.message, MessageType.ERROR);
                return response;
            }
        })
        );
    }

    updateBulkPortfolioRecords(objectName: string, info: any) {
        return this.http.put(PORTFOLIO_APIUrls.UPDATE_BULK_PORTFOLIO_RECORDS(objectName), info).pipe(map(response => {
            if(response.success) {
                return response.data;
            } else {
                // this.portfolioCsmWidgetFacade.showToastMessage(response.error.message, MessageType.ERROR);
                return response;
            }
        })
        );
    }

    getPortfolioConfig(portfolioId: string, isAdminPreview: boolean, scope: PortfolioScopes): Observable<PortfolioConfig> {
        if(!portfolioId && !isAdminPreview) {
            return this.createUserPortfolio(scope);
        }
        const url = isAdminPreview ? PORTFOLIO_APIUrls.GET_ADMIN_PORTFOLIO_CONFIG(portfolioId) : PORTFOLIO_APIUrls.GET_USER_PORTFOLIO_CONFIG(scope, portfolioId);
        return this.http.get(url)
        .pipe(map(response => {
            if(response.result) {
                return response.data;
            } else {
                return response;
            }
        })
        )
    }

    private createUserPortfolio(scope: PortfolioScopes): Observable<PortfolioConfig> {
        return this.http.post(PORTFOLIO_APIUrls.CREATE_USER_PORTFOLIO_CONFIG(scope), {})
        .pipe(map(response => {
            if(response.result) {
                return response.data;
            } else {
                return response;
            }
        })
        )
    }

    updateUserConfig(updatedConfig: PortfolioConfig): Observable<PortfolioConfig> {
        return this.http.put(PORTFOLIO_APIUrls.UPDATE_USER_PORTFOLIO_CONFIG, updatedConfig)
        .pipe(map(response => {
            if(response.result) {
                return response.data;
            } else {
                this.portfolioCsmWidgetFacade.showToastMessage(response.error.message, MessageType.ERROR);
                return response;
            }
        })
        )
    }

}
