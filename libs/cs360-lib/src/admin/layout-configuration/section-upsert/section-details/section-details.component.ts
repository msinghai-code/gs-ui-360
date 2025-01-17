import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import {SectionUpsertService, SharedRouteOutletService} from "../section-upsert.service";
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import { MessageType } from '@gs/gdk/core';
import { APPLICATION_ROUTES } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import {EnvironmentService} from "@gs/gdk/services/environment";
import {LAYOUT_LISTING_CONSTANTS} from "../../layout-listing/layout-listing.constants";
// import { CS360Service} from "@gs/cs360-lib";
import { CS360Service } from '@gs/cs360-lib/src/common';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-section-details',
  templateUrl: './section-details.component.html',
  styleUrls: ['./section-details.component.scss']
})
export class SectionDetailsComponent implements OnInit, OnDestroy {

  public loading = false;
  public isCreateMode: boolean;
  private sectionId: string;
  private sectionType: string;
  public sectionDetails: any;
  private subs = new SubSink();
  public detailForm: FormGroup;
  cloneFrom;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              @Inject("envService") private _env: EnvironmentService,
              private sectionUpsertService: SectionUpsertService,
              private sharedRouteOutletService: SharedRouteOutletService,
              private c360Service: CS360Service,
              private i18nService: NzI18nService
              ) { }

  ngOnInit() {
    this.createForm();
    this.addRouteDataSubscription();
    this.fetchSectionDetails();
  }

  private createForm() {
    const { sectionNameCharLimit, sectionDescriptionCharLimit} = this._env.moduleConfig;
    this.detailForm = this.fb.group({
      label: [null, [Validators.required, Validators.maxLength(sectionNameCharLimit), extraSpaceValidator]],
      description: [null, [Validators.maxLength(sectionDescriptionCharLimit)]]
    });
  }

  private addRouteDataSubscription() {
    this.subs.add(this.route.parent.data.subscribe(response => {
      const { sectionId } = this.route.parent.snapshot.params;
      const queryParams = this.route.snapshot.queryParams;
      this.sectionId = sectionId;
      this.isCreateMode = this.sectionId === 'new';
      this.sectionType = this.route.snapshot.queryParams.type;
      this.cloneFrom = queryParams.cloneFrom;
      if(this.cloneFrom && queryParams.cloneFromLabel) {
        // this.sharedRouteOutletService.emitChange(`Clone Section: ${queryParams.cloneFromLabel}`);
        this.sharedRouteOutletService.emitChange(this.i18nService.translate('360.admin.section_details.cloneSection')+ queryParams.cloneFromLabel);
        this.detailForm.patchValue({
          label: this.i18nService.translate('360.admin.section_details.copyOf')+' ' + queryParams.cloneFromLabel
        });
      }
    }));
  }

  fetchSectionDetails() {
    if(!this.isCreateMode) {
      this.sectionUpsertService
          .getSection(this.sectionId)
          .subscribe((data) => {
            this.sectionDetails = data;
            const { label = null, description = null, sectionLabel = '' } = this.sectionDetails;
            this.detailForm.setValue({label, description});
            this.sharedRouteOutletService.emitChange(label);
          })
    }
  }

  public onSaveClick() {
    if(this.detailForm.valid) {
      // Save this section and get the section id from backend.
      this.loading = true;
      if(this.cloneFrom && this.sectionId === 'new') {
        this.cloneSection();
      }
      else if(this.isCreateMode) {
        this.addSection();
      } else {
        this.updateSection();
      }
    } else {
      // Do something in case of invalid
      this.submitForm();
    }
  }

  submitForm(): void {
    for (const i in this.detailForm.controls) {
      this.detailForm.controls[i].markAsDirty();
      this.detailForm.controls[i].updateValueAndValidity();
    }
  }

  private addSection(): void {
    const moduleConfig = this._env.moduleConfig;
    const { label, description } = this.detailForm.getRawValue();
    this.sectionUpsertService
        .addSection({
          label: label.trim(),
          description,
          sectionType: this.sectionType,
          sectionLabel: moduleConfig.sections.find(s => s.sectionType === this.sectionType).label,
          scope: "GLOBAL",
          entityType: this.ctx.baseObject
        })
        .subscribe((response) => {
          this.loading = false;
          
          if(!response.success) {
            this.openToastMessageBar({
              message: response.error.localizedMessage || response.error.message,
              action: null,
              messageType: MessageType.ERROR
            });

            return;
          }
          const { sectionId } = response.data;
          this.detailForm.markAsPristine();
          // Redirect to section configure page
          this.router.navigate([APPLICATION_ROUTES.SECTIONS_CONFIGURE(sectionId)]);
        });
  }

  private updateSection() {
    this.loading = true;
    const { label, description } = this.detailForm.getRawValue();
    this.sectionUpsertService
        .updateSection(this.sectionId, {
          label: label.trim(),
          description,
          config: this.sectionDetails.config
        })
        .subscribe((response) => {
          this.loading = false;

          if(!response.success) {
            this.openToastMessageBar({
                  message: response.error.localizedMessage || response.error.message,
              action: null,
              messageType: MessageType.ERROR
            });
            return;
          }

          this.detailForm.markAsPristine();
          // Redirect to section configure page
          this.router.navigate([APPLICATION_ROUTES.SECTIONS_CONFIGURE(this.sectionId)]);
        });
  }

  private cloneSection() {
    this.loading = true;
    const { label, description } = this.detailForm.getRawValue();
    this.sectionUpsertService
      .cloneSection({
        label: label.trim(),
        description,
        sectionId: this.cloneFrom,
        entityType: this.ctx.baseObject
      })
      .subscribe((response) => {
        this.loading = false;
        if(response.success) {
          this.openToastMessageBar({
            message: this.i18nService.translate('360.admin.common_layout.CLONED_SUCCESS'),
            action: null,
            messageType: MessageType.SUCCESS
          });

          const { sectionId } = response.data;
          this.detailForm.markAsPristine();
          // Redirect to section configure page
          this.router.navigate([APPLICATION_ROUTES.SECTIONS_CONFIGURE(sectionId)], {
            queryParams: {
              cloneFrom: null,
              cloneFromLabel: null,
              type: null,
            },
            queryParamsHandling: 'merge'
          });
        } else {
          this.openToastMessageBar({
            message: response.error.localizedMessage || response.error.message || this.i18nService.translate('360.admin.common_layout.CLONED_FAILURE'),
            action: null,
            messageType: MessageType.ERROR
          });
        }
      });
  }

  public openToastMessageBar({ message, action = "", messageType }) {
    if (message !== null) {
      // this.toastMessageService.add(message, messageType, action, {
      //   duration: 5000,
      // });
      this.c360Service.createNotification(messageType, message, 5000);
    }
  }

  public onCancelClick() {
    this.router.navigate([APPLICATION_ROUTES.COMMON_LAYOUTS]);
  }

  getIsChanged() {
    return this.detailForm.dirty;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
