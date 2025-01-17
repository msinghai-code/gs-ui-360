import { getFieldMeta, getSourceDetails } from '../portfolio-widget-utils';
// import { initialReportState } from '@gs/core';
import { initialReportState } from '@gs/cs360-lib/src/core-references';

import { GSField } from "@gs/gdk/core";
import { HttpProxyService } from "@gs/gdk/services/http";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PortfolioFieldTreeInfo, PortfolioFieldTreeMap, WidgetField } from '../pojos/portfolio-interfaces';
import { PORTFOLIO_APIUrls, PORTFOLIO_WIDGET_CONSTANTS } from '../pojos/portfolio.constants';
import { cloneDeep, includes, uniqBy } from 'lodash';
import { map, publishReplay, refCount } from "rxjs/operators";
import {NzNotificationService} from "@gs/ng-horizon/notification";

@Injectable({
    providedIn: 'root'
})

export class PortfolioWidgetService {

    fieldSelectedForEdit: GSField;
    schemeListInfoObservable: Observable<any>;
    

    public describeFieldTreeMap: PortfolioFieldTreeMap = {
        relationship: PORTFOLIO_WIDGET_CONSTANTS.INITIAL_FIELD_INFO,
        company: PORTFOLIO_WIDGET_CONSTANTS.INITIAL_FIELD_INFO
    };
    public dependentResponses = {};
    
    constructor(public _http: HttpProxyService, private notification: NzNotificationService) {
    }

    getInitialReportingGridState(objectName: string) {
        const gridState = {...initialReportState};
        gridState.sourceDetails = getSourceDetails(objectName);
        gridState.pageSize = PORTFOLIO_WIDGET_CONSTANTS.GRID_DEFAULT_PAGE_SIZE;
        return gridState;
    }

    setFieldSelectedForEdit(field: GSField) {
        this.fieldSelectedForEdit = field;
    }

    getFieldSelectedForEdit() {
        return this.fieldSelectedForEdit || null;
    }

    fetchDependencyItemMappings(requestInfo: {controllerId: string, dependentId:string}) {
        if(this.dependentResponses[requestInfo.dependentId]) {
            return;
        }
        this._http.post(PORTFOLIO_APIUrls.GET_DEPENDENT_MAPPINGS, [requestInfo]).subscribe(response => {
            this.dependentResponses[requestInfo.dependentId] = response.data[0];
        })  
    }

    getFilteredOptions(dependentId: string, controllerValue: any, allOptions: any) {
        const dependencyIds = this.dependentResponses[dependentId].mappedItems.map(mappedItem => {
            if(mappedItem.controllerId === controllerValue) {
                return mappedItem.dependentId;
            }
        });
        return cloneDeep(allOptions.filter(option => includes(dependencyIds, option.value)));
    }

    setDescribeObjectFieldTree(fieldTree: PortfolioFieldTreeInfo, objectName: string) {
        this.describeFieldTreeMap[objectName] = fieldTree;
    }

    getFieldMeta(field: WidgetField, objectName: string) {
        return getFieldMeta(field, this.describeFieldTreeMap[objectName], objectName);
    }

    getScorecardSchemeListInfo(): Observable<any[]> {
        if(!this.schemeListInfoObservable) {
            this.schemeListInfoObservable = this._http.get("v1/scorecards/schemes").pipe(
                    map(response => this.schemeDataProcessing(response)),
                    publishReplay(1),
                    refCount()
                    );
        }
        return this.schemeListInfoObservable;
    }

    private schemeDataProcessing(schemes) {
        const schemesList = [];
        if (schemes.data) {
          const actualSchemeList = schemes.data;
          const [selectedScheme] = schemes.data.filter(item => item.type === 'NUMERIC');
          if(selectedScheme){
            selectedScheme.actualSchemeList =  selectedScheme.scoringSchemeDefinitionList;
            selectedScheme.scoringSchemeDefinitionList = uniqBy(
              selectedScheme.scoringSchemeDefinitionList,
              item => item.rangeFrom + item.rangeTo
            );
          }
      
          actualSchemeList.forEach((item: any) => {
            if (item.type === 'NUMERIC') {
              schemesList.push(selectedScheme);
            } else {
              schemesList.push(item);
            }
          });
        }
        return schemesList;
    }
    createNotification(type: 'success' | 'info' | 'warning' | 'error', content, nzDuration, nzPlacement?): void {
        this.notification.config({
            nzPlacement
        });
        this.notification[type](
            content,
            {
                nzDuration
            }
        );
    }
}
