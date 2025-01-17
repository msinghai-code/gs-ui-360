import { Injectable } from "@angular/core";
import { EnvironmentService } from "@gs/gdk/services/environment";

@Injectable({
    providedIn: 'root'
})

export class PxService {
    constructor(
        private environmentService: EnvironmentService
    ) {}

    private getTenantDetails(key) {
        if ((window as any).GS && (window as any).GS.userConfig && (window as any).GS.userConfig.instance && (window as any).GS.userConfig.instance[key]) {
            return (window as any).GS.userConfig.instance[key]
        }
        return null;
    }

    pxAptrinsic(name: string, body: any) {
        // if ((window as any).aptrinsic) {
        //     (window as any).aptrinsic(
        //         'track',
        //         name,
        //         {
        //             ...body
        //         });
        //     console.log('Tracking event name', name, body)
        // }

        try {
            if (!(<any>window).aptrinsic) {
                console.log('aptrinsic not defined');
                this.defineAptrinsic();
            }
            (<any>window).aptrinsic('track', name, {...body});
        }
        catch (error) {
            console.error('[PxEventTrackerService]:: Error occurred while trying to track Px event:: eventName::', name, 'Error::', error);
        }
    }

    private defineAptrinsic() {
        // Define aptrinsic if not already defined
        const apt = (...args) => {
            ((<any>window).aptrinsic.q = (<any>window).aptrinsic.q || []).push(args);
        };
        (<any>window).aptrinsic = (<any>window).aptrinsic || apt;
    }

    // Used to track custom attributes
    pxAptrinsicIdentify(name: string, value: any) {
        if ((window as any).aptrinsic) {
            (window as any).aptrinsic(
                'identify',
                {
                    id:this.environmentService.userGSId
                },{
                    [name]: value
                });
            console.log('Custom Attribute Tracking event name', name, value)
        }
    }
}
