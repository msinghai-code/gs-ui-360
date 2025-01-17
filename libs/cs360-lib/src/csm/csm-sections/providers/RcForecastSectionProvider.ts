import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import {CsmRcForecastComponent} from "../modules/csm-rc-forecast/csm-rc-forecast.component";

// @dynamic
export class RcForecastSectionProvider extends AbstractSectionProvider {

    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmRcForecastComponent));
    }
}
