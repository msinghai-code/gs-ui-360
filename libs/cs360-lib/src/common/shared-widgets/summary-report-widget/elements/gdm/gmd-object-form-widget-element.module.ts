// Angular
import { CommonModule } from '@angular/common';
import { LazyElementsModule } from '@angular-extensions/elements';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

// GS Core
// import { GSSpinnerModule } from '@gs/core';

//GDK
import { SpinnerModule } from "@gs/gdk/spinner";


// Horizon
import { NzResultModule } from '@gs/ng-horizon/result';

// Components
import { GdmObjectFormWidgetCs360ElementLoader } from './gdm-object-form-widget-element.loader';
// import { FF_VOLUME_DOWN } from '@angular/cdk/keycodes';
// import { ManageAccessComponent } from '@gs/core/src/shared/src/lib/share-config-setup/manage-access/manage-access.component';

@NgModule({
    declarations: [ GdmObjectFormWidgetCs360ElementLoader ],
    imports:[
        CommonModule,
        NzResultModule,
        SpinnerModule,
        LazyElementsModule
    ],
    entryComponents: [ GdmObjectFormWidgetCs360ElementLoader ],
    exports: [ GdmObjectFormWidgetCs360ElementLoader ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class GdmObjectFormWidgetElementModule { }
