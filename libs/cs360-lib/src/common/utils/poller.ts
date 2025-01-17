import { interval, Observable, Subject } from 'rxjs';
import { startWith, mergeMap, tap, filter, takeUntil } from 'rxjs/operators';

export function poller(myObs$: Observable<any>, func: any): Observable<any> {
    const pollStop = new Subject();
    return interval(4000).pipe(
        startWith(0),
        mergeMap(_ => myObs$),
        filter((val) => func(val)),
        tap(_ => { pollStop.next(); pollStop.complete(); }),
        takeUntil(pollStop)
    );
}