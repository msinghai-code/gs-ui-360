/**
 * created by rpal on 2021-02-26
 */
import {Injectable} from "@angular/core";
import {Observable, of} from 'rxjs';
import { concatMap, timeout, delay } from 'rxjs/operators';

@Injectable()
export class SummarySectionService {

    constructor() { }

    getConfig(): Observable<any> {
        // Make api call from here
        return of(200).pipe(delay(2500));
    }

}
