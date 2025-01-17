import {Inject, Injectable} from "@angular/core";
import {CONTEXT_INFO, ICONTEXT_INFO} from "../context.token";
import {HttpProxyService} from "@gs/gdk/services/http";
import {map} from "rxjs/operators";


@Injectable({
    providedIn: 'root'
})

export class ExternalAppsService{
    constructor(
        private http: HttpProxyService,
        @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
    ) { }

    getExternalFields(objectName: string) {
        return this.http.get(`v1/meta/v10/gdm/objects/${objectName}`)
            .pipe(map(res => ((res && res.data && res.data.columns) || [])
                .filter(f => f.isExternalId)
                .map(f => f.name)));
    }
}
