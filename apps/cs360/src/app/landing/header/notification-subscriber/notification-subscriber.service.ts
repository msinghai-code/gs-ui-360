/**
 * created by rpal
 */

import {Injectable} from "@angular/core";
import {HttpProxyService} from "@gs/gdk/services/http";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotificationSubscriberService {

  constructor(private http: HttpProxyService) { }

  public getSubscribedInfo(entityId: string) {
    return this.http.get(`v1/messenger/entity/${entityId}`)
      .pipe(
        map(response => response.data)
      );
  }

  public subscribeNotification(entityName: string, cId: string, id: string): Observable<any> {
    return this.http.post(`v1/messenger/entity/subscribe/${entityName}/${cId}?id=${id}`, null)
      .pipe(
        map(response => response.data)
      );
  }

  public unsubscribeNotification(entityName: string, cId: string, id: string): Observable<any> {
    return this.http.post(`v1/messenger/entity/unsubscribe/${entityName}/${cId}?id=${id}`, null)
      .pipe(
        map(response => response.data)
      );
  }

}
