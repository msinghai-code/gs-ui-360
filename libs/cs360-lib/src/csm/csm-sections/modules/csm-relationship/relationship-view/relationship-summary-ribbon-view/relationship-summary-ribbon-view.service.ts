import {Inject, Injectable} from '@angular/core';
import {catchError, map, tap} from "rxjs/operators";
import {of} from "rxjs";
import {isEmpty} from "lodash";
import {HttpProxyService} from "@gs/gdk/services/http";
import { EnvironmentService } from '@gs/gdk/services/environment';

@Injectable({
  providedIn: 'root'
})
export class RelationshipSummaryRibbonViewService {

  private cache: any;

  constructor(private http: HttpProxyService,
              @Inject("envService") public env: EnvironmentService) { }

  fetchAttributeData(config: any) {
    const { url, payload } = config;
    return this.http.post(url, payload).pipe(
        catchError(_ => of({}))
    );
  }

  fetchSummaryRibbonBootstrapData() {
    if(!isEmpty(this.cache)) {
      return of(this.cache).toPromise();
    }
    return this.http.get('v2/galaxy/bootstrap/summaryRibbon/config')
                    .pipe(
                        map(response => response.data.ribbon),
                        tap(data => this.cache = data),
                        catchError(_ => of([]))
                    ).toPromise();
  }

}
