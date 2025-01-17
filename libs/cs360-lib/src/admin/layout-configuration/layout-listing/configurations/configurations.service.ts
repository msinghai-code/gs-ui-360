import { Inject, Injectable } from '@angular/core';
import {HttpProxyService} from "@gs/gdk/services/http";
import {Observable} from "rxjs";
import {API_URLS} from "../../layout-configuration.constants";
import {map} from "rxjs/operators";
import { EnvironmentService } from '@gs/gdk/services/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationsService {

  constructor(private http: HttpProxyService, @Inject("envService") private env: EnvironmentService) { }

  fetchRelationshipSectionConfigList(): Observable<any[]> {
    return this.http.get(API_URLS.RELATIONSHIP_SECTION_CONFIG.GET_CONFIG_LIST).pipe(
        map(response => response.data)
    );
  }

}
