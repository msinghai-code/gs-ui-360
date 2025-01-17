import { Injectable } from "@angular/core";
import { HttpProxyService } from "@gs/gdk/services/http";
// import { HttpProxyService } from "@gs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
@Injectable({
    providedIn: "root",
})
export class ConnectionInfoService {
    constructor(private httpClientProxy: HttpProxyService) {}
    getConnectionInfoStatus(): Observable<any> {
        return this.httpClientProxy.get("/v1/roadmap/connection").pipe(
            map((res) => {
                if (res.error) {
                    throw new Error(res.error.message);
                }
                return res;
            })
        );
    }
}
