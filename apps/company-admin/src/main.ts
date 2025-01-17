import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import {LicenseManager} from "@ag-grid-enterprise/core";

window['GS'].convertCurrencyISOCodeToPicklist = true;
LicenseManager.setLicenseKey(atob((environment as any).NG_APP_AG_GRID_KEY));

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
