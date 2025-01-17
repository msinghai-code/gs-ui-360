/**
 * created by rpal on 2021-02-26
 */
import {Injectable} from "@angular/core";
import { forkJoin } from 'rxjs';

import {SectionServiceRegistry} from "../csm-section-registry";

@Injectable({
    providedIn: 'root'
})
export class BasePreLoadService {

    protected config: any;

    protected registeredServiceInstanceMap: any = {};

    constructor() {}

    public fetchConfigBySection(): any {
        const observableInputs = this.createRegisteredServiceInstancesAndObservableInput();
        return forkJoin(observableInputs);
    }

    private createRegisteredServiceInstancesAndObservableInput() {
        const registeredServiceMap = SectionServiceRegistry.getAllRegisteredServices();
        const section = {};
        for(const prop in registeredServiceMap) {
            if(!!prop && registeredServiceMap[prop]) {
                this.registeredServiceInstanceMap[prop] = new registeredServiceMap[prop]();
                section[prop] = this.getRegisteredServiceInstance(prop).getConfig();
            }
        }

        return section;
    }

    protected getRegisteredServiceInstance(type: string): any {
        return this.registeredServiceInstanceMap[type];
    }

    protected getConfig(): any {
        return this.config;
    }

}
