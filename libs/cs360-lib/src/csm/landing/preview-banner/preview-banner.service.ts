import { Injectable } from '@angular/core';
import { HttpProxyService } from "@gs/gdk/services/http";
import { API_ENDPOINTS } from "@gs/cs360-lib/src/common";
import {map, publishReplay, refCount} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class PreviewBannerService {

  constructor(private http: HttpProxyService) { }

  fetchPreviewRecords(payload: { limit: number, objectName: string, offset: number, select: string[], where?: any }, isDefault?: boolean) {
    return this.http.post(API_ENDPOINTS.GET_OBJECT_DATA(payload.objectName), payload)
      .pipe(map((response: any) => {
        return response.data;
      }), publishReplay(1), refCount());
  }

}
