import {LicenseManager} from "@ag-grid-enterprise/core";
declare let __webpack_public_path__;
__webpack_public_path__ = window['GS'].cdnUrl;
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

LicenseManager.setLicenseKey(atob((environment as any).NG_APP_AG_GRID_KEY));

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.log(err));
