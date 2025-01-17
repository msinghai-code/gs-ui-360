import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
  Inject
} from "@angular/core";
import { getCdnPath } from "@gs/gdk/utils/cdn";
import { HttpProxyService } from "@gs/gdk/services/http";
import { Store } from "@ngrx/store";
import isEmpty from "lodash/isEmpty";
import { NzIconService } from "@gs/ng-horizon/icon";
import { PortfolioCsmWidgetComponent } from "./portfolio-csm-widget/portfolio-csm-widget.component";
import { IFilterable } from "@gs/portfolio-lib";
import { environment } from "../environments/environment";
import { EnvironmentService } from "@gs/gdk/services/environment";
import { GSWindow } from "@gs/gdk/core/types";
import { PortfolioWidgetService } from "../../../../libs/portfolio-lib/src/portfolio-widget-grid/portfolio-widget.service";
declare let window: GSWindow;

@Component({
  selector: 'gs-portfolio-csm',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', '../ng-horizon.less'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent implements OnInit, IFilterable {
  @ViewChild(PortfolioCsmWidgetComponent, { static: false })
  csmWidget: PortfolioCsmWidgetComponent;

  @Input() properties;
  @Input() id;

  @Output() changes: EventEmitter<any> = new EventEmitter<any>();

  static bootstrapCall: any = null;
  initiated = false;

  constructor(
    private store: Store<any>,
    @Inject("envService") public env: EnvironmentService,
    private _http: HttpProxyService,
    private iconService: NzIconService,
    private portfolioWidgetService: PortfolioWidgetService
  ) {
    this.prepareIconService();
    // this.iconService.changeAssetsSource(this.env.getGS().cdnPath);
  }

  protected async prepareIconService() {
    if (environment.production) {
      const cdnPath = await getCdnPath("portfolio-csm");
      this.iconService.changeAssetsSource(cdnPath);
      this.initiated = true;
    } else {
      this.iconService.changeAssetsSource("http://localhost:4200");
      this.initiated = true;
    }
  }

  async ngOnInit() {
    let data;
    if (window.host === "SALESFORCE") {
      AppComponent.bootstrapCall =
        AppComponent.bootstrapCall ||
        this._http.get("v1.0/api/describe/SALESFORCE/bootstrap").toPromise();
      data = await AppComponent.bootstrapCall;
      const { host, user, gsUser, instance } = data.data;
      this.env.setEnv({ user, host, instance, gsUser });
    } else {
      const { user, host, instance } = this.env.gsObject.userConfig;
      this.env.setEnv({ user, host, instance });
    }
    this.store.select("globalMessage").subscribe(msgObj => {
      if (!isEmpty(msgObj)) {
        this.openToastMessageBar(msgObj);
      }
    });
  }

  @Input()
  get getSourceDetails(): any {
    return this.csmWidget.getSourceDetails();
  }

  @Input() isFilterable = () => this.csmWidget.isFilterable();

  @Input()
  set onFilterUpdate(globalFilter) {
    this.csmWidget.onFilterUpdate(globalFilter);
  }

  @Input()
  set onWidgetDelete(deleted) {
    this.csmWidget.onWidgetDelete();
  }

  @Input() getPropertiesToPersist = () =>
    this.csmWidget.getPropertiesToPersist();

  openToastMessageBar({ message, action = "", messageType }) {
    if (!isEmpty(message)) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.portfolioWidgetService.createNotification(
        messageType,
        message,
        5000
      );
    }
  }
}
