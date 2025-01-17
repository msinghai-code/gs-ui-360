import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { PortfolioConfig } from '@gs/portfolio-lib';
import { cloneDeep } from 'lodash';
import { COMPANY_SOURCE_DETAILS, PORTFOLIO_WIDGET_CONSTANTS, RELATIONSHIP_SOURCE_DETAILS } from '@gs/portfolio-lib';

@Component({
  selector: 'gs-portfolio-light-admin-grid',
  templateUrl: './portfolio-light-admin-grid.component.html',
  styleUrls: ['./portfolio-light-admin-grid.component.scss']
})
export class PortfolioLightAdminGridComponent implements OnInit, OnChanges {

    @Input() config: PortfolioConfig;
    @Input() configuredObjectNames: string[];

    widgetConfig: PortfolioConfig;
    showMeCompanyFields: string[] = [];
    showMeRelationshipFields: string[] = [];
    companySourceDetails = COMPANY_SOURCE_DETAILS;
    relationshipSourceDetails = RELATIONSHIP_SOURCE_DETAILS;
    objectName: string;
    
    ngOnInit() {
        // this is done for FLP
        this.config.configuration.company.showFields = this.config.configuration.company.showFields.filter(field => !field.hidden);
        this.config.configuration.relationship.showFields = this.config.configuration.company.showFields.filter(field => !field.hidden);
    }

    ngOnChanges() {
        if(this.config) {
            this.setProperties();
        }
    }

    setProperties() {
        if(!this.objectName) {
            this.objectName = this.config.configuration.company.showTab ? PORTFOLIO_WIDGET_CONSTANTS.COMPANY_OBJECT_NAME : PORTFOLIO_WIDGET_CONSTANTS.RELATIONSHIP_OBJECT_NAME;
        }
        this.showMeCompanyFields = (this.config.configuration.company.showFields.map(showField => showField.displayName)).splice(2);
        this.showMeRelationshipFields = (this.config.configuration.relationship.showFields.map(showField => showField.displayName)).splice(2);
    }


}
