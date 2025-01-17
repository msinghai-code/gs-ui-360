import { Injectable } from '@angular/core';
import {HttpProxyService} from "@gs/gdk/services/http";

@Injectable({
  providedIn: 'root'
})
export class UsageConfigurationService {

    constructor(private http: HttpProxyService) {}

}
