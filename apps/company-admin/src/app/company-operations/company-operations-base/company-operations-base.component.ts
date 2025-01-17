import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Subject } from 'rxjs';

@Component({
  selector: 'gs-company-operations-base',
  templateUrl: './company-operations-base.component.html',
  styleUrls: ['./company-operations-base.component.scss']
})
export class CompanyOperationsBaseComponent implements OnInit, OnDestroy {

  componentSubscription: any = new Subject<void>();

  constructor() { }

  ngOnInit() {
  }


  public ngOnDestroy(): void {
    this.componentSubscription.next();
    this.componentSubscription.complete();
  }
}
