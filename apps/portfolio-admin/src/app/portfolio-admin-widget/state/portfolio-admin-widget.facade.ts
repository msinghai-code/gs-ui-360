import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { portfolioAdminWidgetQuery } from './portfolio-admin-widget.selectors';
import { DescribeObject, ShowToastMessage } from './portfolio-admin-widget.actions';
import { PortfolioAdminWidgetPartialState } from './portfolio-admin-widget.reducer';
import { MessageType, HostInfo } from '@gs/gdk/core';
import { isEmpty } from 'lodash';
import { PortfolioWidgetService } from '../../../../../../libs/portfolio-lib/src/portfolio-widget-grid/portfolio-widget.service';

@Injectable()
export class PortfolioAdminWidgetFacade {

  private isObjectDescribedMap: {};

  isObjectDescribed$ = this.store.pipe(select(portfolioAdminWidgetQuery.isObjectDescribedMap));
  getCompanyFields$ = this.store.pipe(select(portfolioAdminWidgetQuery.getCompanyFields));
  getRelationshipFields$ = this.store.pipe(select(portfolioAdminWidgetQuery.getRelationshipFields));

  constructor(private store: Store<PortfolioAdminWidgetPartialState>, private portfolioWidgetService: PortfolioWidgetService) {
    this.addObjectDescribedSubscription();
  }

  addObjectDescribedSubscription() {
    this.isObjectDescribed$.subscribe(map => this.isObjectDescribedMap = map);
  }

  showToastMessage(message: string, messageType: any) {
    if (!isEmpty(message)) {
      this.portfolioWidgetService.createNotification(messageType,"Portfolio: " + message,'');
    }
  }

  describeObject(host: HostInfo) {
    if(this.isObjectDescribedMap[host.name]) {
      return;
    }
    this.store.dispatch(new DescribeObject(host));
  }

}
