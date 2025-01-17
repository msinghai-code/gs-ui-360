import { GSField } from '@gs/gdk/core';
import { HttpProxyService } from "@gs/gdk/services/http";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { uniqBy } from 'lodash';
import { map, publishReplay, refCount } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})

export class HealthScoreService {

    fieldSelectedForEdit: GSField;
    schemeListInfoObservable: Observable<any>;
    
    constructor(public _http: HttpProxyService) {
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
}
