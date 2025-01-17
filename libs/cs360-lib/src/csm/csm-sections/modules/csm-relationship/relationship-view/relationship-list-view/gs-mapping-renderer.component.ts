/**
 * Created by rpal on 2020-01-16
 */

import {Component, Inject, Input, OnInit} from '@angular/core';
import { isValidHTMLTagFromString } from "@gs/gdk/utils/common";
import { ALLOWED_HTML_TAG_FOR_STRING_DTS} from '@gs/gdk/grid';
import {HybridHelper} from "@gs/gdk/utils/hybrid";
import { SfdcNavigator } from "@gs/gdk/utils/sfdc";
import { EnvironmentService } from '@gs/gdk/services/environment';

 export const mappingToNativeUrlMap = {
   'GS_COMPANY_NAME': 'customersuccess360?cid=',
   'GS_RELATIONSHIP_NAME': 'Relationship360?rid=',
   'GS_ANT_ACTIVITY_SUBJECT': 'timeline#/activities/',
   'GS_CALL_TO_ACTION_NAME': 'cockpit?ctaId=',
   'GS_SUCCESS_PLAN_NAME': 'Successplan?spId=',
   // Hybrid SFDC Mappings
   'SFDC_ACCOUNT_NAME': 'customersuccess360?cid=',
   'SFDC_RELATIONSHIP_NAME': 'Relationship360?rid=',
   'SFDC_CASE_NUMBER': '',
   'SFDC_CALL_TO_ACTION_NAME': 'Workflow?ctaId=',
   'SFDC_CALL_TO_ACTION_GROUP_NAME': 'Successplan?spId=',
   'SFDC_CUSTOMER_INFO_NAME': 'customersuccess360?cid='
 };
 
 /**
  * Need to validate if it is same for native and then merge with native
  */
 export const mappingToHybridSpecificUrlMap = {
   'SFDC_ACCOUNT_NAME': 'customersuccess360?aid=',
 };
 
 export const mappingToSFDCUrlMap = {
   // Gainsight Mappings
   'GS_COMPANY_NAME': 'customersuccess360?cid=',
   'GS_RELATIONSHIP_NAME': 'Relationship360?rid=',
   'GS_ANT_ACTIVITY_SUBJECT': 'timeline#/activities/',
   'GS_CALL_TO_ACTION_NAME': 'cockpit?ctaId=',
   'GS_SUCCESS_PLAN_NAME': 'Successplan?spId=',
   // Salesforce Mappings
   'SFDC_ACCOUNT_NAME': 'customersuccess360?cid=',
   'SFDC_RELATIONSHIP_NAME': 'Relationship360?rid=',
   'SFDC_CASE_NUMBER': '',
   'SFDC_CALL_TO_ACTION_NAME': 'Workflow?ctaId=',
   'SFDC_CALL_TO_ACTION_GROUP_NAME': 'Successplan?spId=',
   'SFDC_CUSTOMER_INFO_NAME': 'customersuccess360?cid='
 };
 
 @Component({
   template: `<ng-container [ngSwitch]="displayText">
                 <span *ngSwitchCase="'NULL'">{{displayText}}</span>
                 <a [appLink360]="params" href="javascript:void(0);">{{displayText}}</a>
             </ng-container>`
 })
 
 export class GsMappingRendererComponent {
 
   public params: any;
 
   public displayText: string;
 
   constructor(@Inject("envService") private env: EnvironmentService) {}
 
   agInit(params: any): void {
    //  this.params = params;
     this.params = {value: params.value && params.value.k , pageContext:"R360"};
     const formattedValue: string = params.valueFormatted ? params.valueFormatted : (params.value ? params.value.fv : '');
     try {
       // Show only innerText for the HTML strings
       const nodesList = isValidHTMLTagFromString(formattedValue ? formattedValue : '', ALLOWED_HTML_TAG_FOR_STRING_DTS.join(', '));
       if (nodesList.length) {
         this.displayText = formattedValue ? formattedValue : "";
       } else {
         this.displayText = formattedValue;
       }
     } catch (e) {
       // Fallback to pristine formatted value.
       this.displayText = formattedValue;
     }
   }
 
   refresh(): boolean {
     return false;
   }
 
   public handleClick($event) {
     try {
       if(!this.params.disableHyperlinkRedirection) {
         const colDef = this.getColDef();
         const mapping = !!colDef && !!colDef.properties ? colDef.properties.reference : '';
         let url: string = this.getUrlByMappingAndHost(mapping);
         if(HybridHelper.isSFDCHybridHost()){
           HybridHelper.navigateToURL(url, true);
         } else {
           window.open(url, '_blank');
         }
       }
     } catch(e) {
       console.log('Error in hyperlinks');
     }
   }
 
   private getUrlByMappingAndHost(mapping: string): string {
     const host: string = this.env.host;
     if(host === 'GAINSIGHT') {
       return this.hybridUrlsByMappings(mapping);
     } else {
       return this.sfdcUrlsByMapping(mapping);
     }
   }
 
   /**
    * Hybrid url by mapping.
    * @param mapping
    */
   hybridUrlsByMappings(mapping: string) {
     const params = this.params;
     switch (mapping) {
       case 'SFDC_CASE_NUMBER':
         return HybridHelper.isSFDCHybridHost()
               ? HybridHelper.generateObjectLink(params.value.k)
               : HybridHelper.generateNavLink(`${mappingToSFDCUrlMap[mapping]}${params.value.k}`);
       case 'SFDC_ACCOUNT_NAME':
         return HybridHelper.isSFDCHybridHost
               ? HybridHelper.generateNavLink(`${mappingToHybridSpecificUrlMap[mapping]}${params.value.k}`)
               : HybridHelper.generateNavLink(`${mappingToNativeUrlMap[mapping]}${params.value.k}`)
       default:
         const pageUrl: string = mappingToNativeUrlMap[mapping];
         return HybridHelper.generateNavLink(`${pageUrl}${params.value.k}`);
     }
   }
 
   /**
    * SFDC url by mapping.
    * @param mapping
    */
   sfdcUrlsByMapping(mapping?: string) {
     const params = this.params;
     const instance: any = this.env.instanceDetails;
     const packageNS = instance && instance.packageNS || '';
     let url;
     switch (mapping) {
       case 'SFDC_CASE_NUMBER':
               url = `/${mappingToSFDCUrlMap[mapping]}${params.value.k}`;
               break;
       default:
               url = `/apex/${packageNS}${mappingToSFDCUrlMap[mapping]}${params.value.k}`;
               break;
     }
     return url;
   }
 
   private getColDef() {
     return this.params.colDef;
   }
 }
