import {
    Component,
    EventEmitter, Inject,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { IFilterable } from '@gs/portfolio-lib';
import { isEmpty } from 'lodash';
import { NzIconService } from '@gs/ng-horizon/icon';
import { PortfolioAdminWidgetComponent } from './portfolio-admin-widget/portfolio-admin-widget.component';
import { Store } from '@ngrx/store';
import {EnvironmentService} from "@gs/gdk/services/environment";
import { PortfolioWidgetService } from '../../../../libs/portfolio-lib/src/portfolio-widget-grid/portfolio-widget.service';
import {getCdnPath} from "@gs/gdk/utils/cdn";
import { environment } from "../environments/environment";


@Component({
  selector: 'gs-portfolio-admin',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', '../ng-horizon.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent implements OnInit, IFilterable {
  
  @ViewChild(PortfolioAdminWidgetComponent, {static: false}) adminWidget : PortfolioAdminWidgetComponent;

  @Input() properties;
  @Input() id;

  @Output()changes: EventEmitter<any> = new EventEmitter<any>();
  initiated = false;

  constructor(
    private store: Store<any>,
    @Inject("envService") public env: EnvironmentService,
    private iconService: NzIconService,
    private portfolioWidgetService: PortfolioWidgetService) {
    this.iconService.changeAssetsSource(this.env.gsObject.cdnPath);
  }

  async ngOnInit() {
      // const baseUrl = await this.cdnService.getCdnPath("portfolio-admin");
      // this.iconService.changeAssetsSource(baseUrl);
    this.prepareIconService();
    this.store
      .select("globalMessage")
      .subscribe((msgObj) => {
        if (!isEmpty(msgObj)) {
          this.openToastMessageBar(msgObj);
        }
      });
    // const {userConfig} = this.env.gsObject.userConfig;
    // this.env.setEnv({user: userConfig.user, host:userConfig.host, instance:userConfig.instance});
  }

  protected async prepareIconService() {
    if (environment.production) {
      const cdnPath = await getCdnPath("portfolio-admin");
      this.iconService.changeAssetsSource(cdnPath);
      this.initiated = true;
    } else {
      this.initiated = true;
      this.iconService.changeAssetsSource("http://localhost:4200");
    }
  }

  @Input() getPropertiesToPersist = () =>  this.adminWidget.getPropertiesToPersist();

  @Input()
  get getSourceDetails(): any {
      return this.adminWidget.getSourceDetails();
  }

  @Input() isFilterable = () => this.adminWidget.isFilterable();
  @Input() getTitle = () => this.adminWidget.getTitle();

  @Input()
  set onFilterUpdate(globalFilter) {
      this.adminWidget.onFilterUpdate(globalFilter);
  }

  // clearUserState will trigger from home team when we click set as home so @input required here
  @Input()
  clearUserState = () => this.adminWidget.clearUserState("GSHome", this.properties.portfolioId);

  openToastMessageBar({message, action = "", messageType}) {
    if (!isEmpty(message)) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.portfolioWidgetService.createNotification(messageType, message, 5000)
    }
  }
}
