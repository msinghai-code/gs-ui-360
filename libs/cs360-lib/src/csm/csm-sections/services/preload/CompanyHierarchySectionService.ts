/**
 * created by rpal on 2021-02-26
 */
import {Injectable} from "@angular/core";
import {Observable, of} from 'rxjs';

@Injectable()
export class CompanyHierarchySectionService {

    constructor() { }

    getConfig(): Observable<any> {
        // Make api call from here
        return of(200);
    }

}
