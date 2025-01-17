import { AbstractSectionProvider } from '@gs/cs360-lib/src/common';
import {CsmSurveyComponent} from "../modules/csm-survey/csm-survey.component";

// @dynamic
export class SurveyProvider extends AbstractSectionProvider {
    
    constructor() { super(); }
    public static getSectionView() {
        return new Promise(resolve => resolve(CsmSurveyComponent));
    }

}
