import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { MessageType, HostInfo } from '@gs/gdk/core';
import { PortfolioCsmWidgetPartialState } from './portfolio-csm-widget.reducer';
import { DescribeObject, ShowToastMessage } from './portfolio-csm-widget.actions';
import { portfolioCsmWidgetQuery } from './portfolio-csm-widget.selectors';

@Injectable()
export class PortfolioCsmWidgetFacade {

  isObjectDescribed$ = this.store.pipe(select(portfolioCsmWidgetQuery.isObjectDescribedMap));
  getCompanyFields$ = this.store.pipe(select(portfolioCsmWidgetQuery.getCompanyFields));
  getRelationshipFields$ = this.store.pipe(select(portfolioCsmWidgetQuery.getRelationshipFields));

  private isObjectDescribedMap: {};

  constructor(private store: Store<PortfolioCsmWidgetPartialState>) {
    this.addObjectDescribedSubscription();
  }

  addObjectDescribedSubscription() {
    this.isObjectDescribed$.subscribe(map => this.isObjectDescribedMap = map);
  }

  showToastMessage(message: string, messageType: MessageType) {
    this.store.dispatch(new ShowToastMessage({
      message: { value: "Portfolio: " + message },
      data: { messageType },
    }));
  }

  describeObject(host: HostInfo) {
    if(this.isObjectDescribedMap[host.name]) {
      return;
    }
    this.store.dispatch(new DescribeObject(host));
  }
}
