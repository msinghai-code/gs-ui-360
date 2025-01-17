/**
 * created by rpal
 */

import {Inject, Injectable, Pipe, PipeTransform} from "@angular/core";
import {HttpProxyService} from "@gs/gdk/services/http";
import {map} from "rxjs/operators";
import {CONTEXT_INFO, ICONTEXT_INFO, isMini360} from "@gs/cs360-lib/src/common";
import { EnvironmentService } from "@gs/gdk/services/environment";

export interface Relationship {
  gsid: string;
  name: string;
  typeId: string;
  typeName: string;
  [key: string]: any;
}

export interface RelationshipsByType {
  type: string;
  relationships: Relationship[]
}

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor(private http: HttpProxyService,@Inject("envService") private env: EnvironmentService) { }

}

@Pipe({
    name: 'addPX',
    pure: false
})

export class PXPipe implements PipeTransform {
    constructor( @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO) {
    }
    transform(action) {
        if(isMini360(this.ctx)){
            return `${"mini_360_create_"+ action.sectionType}`;
        } else {
            return `${this.ctx.pageContext+"-create-"+ action.sectionType}`;
        }

    }
}
