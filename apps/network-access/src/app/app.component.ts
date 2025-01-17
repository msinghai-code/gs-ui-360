import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router, ActivationEnd, NavigationEnd } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NetworkaccessFacade } from './network-access/state/networkaccess.facade';
import { NETWORK_ACCESS_CONSTS } from './network-access.constant';
import { HybridHelper } from "@gs/gdk/utils/hybrid";
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: "gs-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  componentSubscription: Subject<any> = new Subject<void>();
  globalMesssage: Observable<any>;
  moduleLoading: boolean = true;

  constructor(private snackBar: MatSnackBar, private router: Router, private networkAccessFacade: NetworkaccessFacade,private i18nService: NzI18nService) {
    // this.networkAccessFacade.updateModuleTitle(NETWORK_ACCESS_CONSTS.PAGE_TITLE);
    this.globalMesssage = this.networkAccessFacade.globalMesssage$;
  }

  appTitle = this.i18nService.translate('360.NETWORK_ACCESS_CONSTS.PAGE_TITLE');

  ngOnInit(): void {
    this.subscribeForRouteEvents();
    this.subscribeForGlobalMessage();
  }

  subscribeForRouteEvents(): void {
    this.router.events.pipe(takeUntil(this.componentSubscription)).subscribe((evt) => {
      if(evt instanceof NavigationEnd) {
        try {
          HybridHelper.updateHostHash(evt.url);
          console.info('Hash updated to', evt.url);
        } catch (e) {
          console.error('Unable to update hash!!!.');
        }
      }
      if (evt instanceof ActivationEnd) {
        this.moduleLoading = false;
      }
    });
  }

  subscribeForGlobalMessage(): void {
    this.globalMesssage.pipe(takeUntil(this.componentSubscription)).subscribe((value) => {
      if (value && value.message)
        this.snackBar.open(value.message, '', { duration: 5000 });
    });
  }

  ngOnDestroy(): void {
    this.componentSubscription.next();
    this.componentSubscription.complete();
  }
}
