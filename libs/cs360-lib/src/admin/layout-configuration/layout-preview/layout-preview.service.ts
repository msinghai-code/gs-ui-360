import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@gs/cs360-lib/src/common';
import {map, publishReplay, refCount} from "rxjs/operators";
import { HttpProxyService } from "@gs/gdk/services/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LayoutPreviewService {

  constructor(private http: HttpProxyService) { }

  fetchPreviewRecords(payload: { limit: number, objectName: string, offset: number, select: string[], where?: any }, isDefault?: boolean) {
    return this.http.post(API_ENDPOINTS.GET_OBJECT_DATA(payload.objectName), payload)
        .pipe(map((response: any) => {
          return response.data;
        }), publishReplay(1), refCount());
  }

    fetchLayoutInfo(layoutId: string): Observable<string> {
        return this.http.get(API_ENDPOINTS.GET_LAYOUT(layoutId))
            .pipe(map((response: any) => {
                return !!response && !!response.data ? response.data.name: 'NA';
            }));
    }

}
