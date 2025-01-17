import { Component, Inject, OnInit } from '@angular/core';
import { EnvironmentService } from '@gs/gdk/services/environment';

@Component({
    selector: 'gs-csm-survey',
    templateUrl: './csm-survey.component.html',
    styleUrls: ['./csm-survey.component.scss']
})
export class CsmSurveyComponent implements OnInit {
    elementTag = 'gs-survey-c360';
    url: string;
    moduleConfig;
    section;
    constructor(@Inject("envService") public env: EnvironmentService) {
    }

    ngOnInit(): void {
        this.url = `${this.env.gsObject.autonomousUrls['survey-response']}/widgets/main-es2015.js`; 
        this.moduleConfig = this.env.moduleConfig;
    }

}
