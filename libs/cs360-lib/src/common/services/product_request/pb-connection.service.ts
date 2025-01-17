import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HttpProxyService } from '@gs/gdk/services/http';
const PRODUCT_BOARD_CONNECTION_URL = "/v1/roadmap/connection/product-board";
@Injectable({
    providedIn: "root",
})
export class productBoardConnectionService {
    constructor(private httpClientProxy: HttpProxyService) {}
    getProductBoardConnectionStatus(): Observable<any> {
        return this.httpClientProxy.get(PRODUCT_BOARD_CONNECTION_URL).pipe(
            map((res) => {
                if (res.error) {
                    throw new Error(res.error.message);
                }
                return res;
            })
        );
    }
}
