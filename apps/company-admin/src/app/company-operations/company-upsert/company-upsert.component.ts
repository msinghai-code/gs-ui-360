import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { isEmpty } from 'lodash';
import { CompaniesFacade } from '../state/companies.facade';
import { takeUntil } from 'rxjs/operators';
import { CompanyUpsertResolverResponse } from '../interfaces';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { NzNotificationService } from '@gs/ng-horizon/notification';
@Component({
  selector: 'gs-company-upsert',
  templateUrl: './company-upsert.component.html',
  styleUrls: ['./company-upsert.component.scss']
})
export class CompanyUpsertComponent implements OnInit, OnDestroy {

  companyUpsertInfo: CompanyUpsertResolverResponse;
  submitLabel = this.i18nService.translate('360.company_upsert.update');
  loading = false;
  errorNotification = false

  private componentSubscription: any = new Subject<void>();
  private isEdit = true;
  

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private companiesFacade: CompaniesFacade,
    private i18nService: NzI18nService,
    private notification: NzNotificationService) { }

  ngOnInit() {
    this.getRouteDataSubscription();
  }
  
  private addUpsertSuccessSubscription(isEdit?: boolean) {
    this.errorNotification = true;
    return this.companiesFacade.isUpsertSuccess$
    .pipe(takeUntil(this.componentSubscription))
    .subscribe(response => {
      if(response && response.success) {
        this.router.navigate([""]);
        const message = isEdit ? "Updated Successfully": "Created Successfully";
        this.createBasicNotification("success", message);
      } else if(response) {
        this.loading = false;
        if(this.errorNotification){
          this.createBasicNotification("error", response && response.message && response.message.value || "");
          this.errorNotification=false;
        }
      }
    });
  }

  private createBasicNotification(type, message): void{
    this.notification.create(type,'', message, [],{nzDuration:2000});
  }
  
  private getRouteDataSubscription() {
    return this.activatedRoute.data
    .pipe(takeUntil(this.componentSubscription))
    .subscribe((response: {data: CompanyUpsertResolverResponse}) => {
      this.companyUpsertInfo = response.data;
      if(!this.companyUpsertInfo.error) {
        if(isEmpty(this.companyUpsertInfo.recordId)) {
          this.isEdit = false;
          this.submitLabel = this.i18nService.translate('360.company_upsert.create');
        }
      } else {
        this.router.navigate([""]);
        this.companiesFacade.dispatchCompanyUpsertLoadError(this.companyUpsertInfo);
      }
    });
  }

  onCancelClick() {
    this.router.navigate([""]);
  }
  
  onObjectUpdate(companyInfo: {value: any, fields: any[]}) {
    if(!this.isEdit) {
      delete companyInfo.value.Gsid;
    }
    this.loading = true;
    this.companiesFacade.dispatchCompanyUpdate(companyInfo, this.isEdit);
    this.addUpsertSuccessSubscription(this.isEdit);
  }

  ngOnDestroy() {
    this.componentSubscription.next();
    this.componentSubscription.complete();
  }

}
