import { Injectable } from '@angular/core';
import { updateFiltersBasedOnIsApplicable } from '@gs/gdk/filter/global';
import { MessageType } from '@gs/gdk/core';
import { HttpProxyService } from "@gs/gdk/services/http";
import { PortfolioConfig, PortfolioGridState, PORTFOLIO_APIUrls, PORTFOLIO_WIDGET_CONSTANTS } from '@gs/portfolio-lib';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PortfolioAdminWidgetFacade } from './state/portfolio-admin-widget.facade';

interface GridStateForObject {
    gridState: PortfolioGridState;
    objectName: string;
}

@Injectable({
    providedIn: 'root'
})

export class PortfolioAdminWidgetService {

    private gridStateSubject = new Subject<GridStateForObject>();
    private portfolioDataSubject = new Subject<any>();

    private requestSource: string;

    public portfolioDataObservable = this.portfolioDataSubject.asObservable();
    
    constructor(private http: HttpProxyService, private portfolioAdminWidgetFacade: PortfolioAdminWidgetFacade) {
        this.gridStateSubject.subscribe(info => {
            if(!this.requestSource.includes("DASHBOARD")) {
                info.gridState.globalFilter = updateFiltersBasedOnIsApplicable(info.gridState.globalFilter || {conditions: [], expression: ""});
            }
            this.getPortfolioGridData(info).subscribe(data => {
                this.portfolioDataSubject.next(data);
            })
        })
    }

    getInitialGridState(): PortfolioGridState {
        const gridState = {...PORTFOLIO_WIDGET_CONSTANTS.INITIAL_GRID_STATE};
        return gridState;
    }

    setGridState(gridState: PortfolioGridState, objectName: string) {
        this.gridStateSubject.next({gridState, objectName});
    }

    setRequestSource(source: string) {
        this.requestSource = source;
    }

    getRequestSource(): string {
        return this.requestSource;
    }
    
    createAdminPortfolioConfig(scope: string): Observable<PortfolioConfig> {
        return this.http.post(PORTFOLIO_APIUrls.CREATE_ADMIN_PORTFOLIO_CONFIG(scope), {})
        .pipe(map(response => {
            if(response.result) {
                return response.data;
            } else {
                this.portfolioAdminWidgetFacade.showToastMessage(response.error.message, MessageType.ERROR);
                return response;
            }
        })
        )
    }

    getPortfolioConfig(portfolioId: string): Observable<PortfolioConfig> {
        return this.http.get(PORTFOLIO_APIUrls.GET_ADMIN_PORTFOLIO_CONFIG(portfolioId))
        .pipe(map(response => {
            if(response.result) {
                return response.data;
            } else {
                this.portfolioAdminWidgetFacade.showToastMessage(response.error.message, MessageType.ERROR);
                return response;
            }
        })
        )
    }

    updatePortfolioConfig(portfolioId: string, config: PortfolioConfig) {
        return this.http.put(PORTFOLIO_APIUrls.UPDATE_ADMIN_PORTFOLIO_CONFIG(portfolioId), config)
        .pipe(map(response => {
            if(response.result) {
                return response.data;
            } else {
                this.portfolioAdminWidgetFacade.showToastMessage(response.error.message, MessageType.ERROR);
                return response;
            }
        })
        )
    }

    private getPortfolioGridData(info: GridStateForObject): Observable<PortfolioConfig> {
        return this.http.post(PORTFOLIO_APIUrls.GET_PORTFOLIO_DATA(info.objectName), info.gridState).pipe(map(response => {
            if(response.success) {
                return response.data;
            } else {
                this.portfolioAdminWidgetFacade.showToastMessage(response.error.message, MessageType.ERROR);
                return response;
            }
        })
        );
    }

    clearUserState(source, id) {
        const url = PORTFOLIO_APIUrls.GET_USER_PORTFOLIO_CONFIG(source, id);
        return this.http.delete(url).pipe(map(response => {
            if(response.success) {
                return response.data;
            } else {
                this.portfolioAdminWidgetFacade.showToastMessage(response.error.message, MessageType.ERROR);
                return response;
            }
        })
        )
    }
}
