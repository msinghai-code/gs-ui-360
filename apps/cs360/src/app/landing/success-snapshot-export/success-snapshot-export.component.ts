import {ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import { CS360CacheService, CS360Service, CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { isEmpty } from 'lodash';
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import { EnvironmentService } from '@gs/gdk/services/environment';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-success-snapshot-export',
  templateUrl: './success-snapshot-export.component.html',
  styleUrls: ['./success-snapshot-export.component.scss']
})
export class SuccessSnapshotExportComponent implements OnInit {


  public selectedValue= null;
  public selectedSS= null;
  public selectedSP= null;
  public selectedFolderId = null;
  public selectedSSName: string;
  public foldersLoaded: boolean = false;
  public sPReportPresent: boolean
  public rShipReportPresent: boolean;
  public ignoreInactive: boolean;
  public slideDeckTitle: string;

  randomUserUrl = 'https://api.randomuser.me/?results=5';
  searchChange$ = new BehaviorSubject('');
  optionList: any;
  isLoading = false;
  inputValue: any;
  isSpCall: boolean = false;
  isShareDisabled = false;

  @Input() successPlans: any;
  @Input() snapshot: any;
  @Input() snapshots: any;
  @Input() recipients: any;
  @Input() showEntity: any;
  @Input() selectedUser: any;
  @Input() isAuthenticated: boolean;
  @Input() showListing: boolean;
  @Input() sPAccessCheck: boolean;
  @Input() rShipAccessCheck: boolean;
  @Input() firstTime: boolean;
  @Input() isSsHaEnabled: boolean;

  @Output() action= new EventEmitter<any>();


  shareConfigForm: FormGroup

  constructor(private cS360CacheService: CS360CacheService,
              private c360Service: CS360Service,
              private _fb: FormBuilder,
              private http: HttpClient,
              @Inject(CONTEXT_INFO) public ctx,
              @Inject("envService") private env: EnvironmentService,
              private cdr: ChangeDetectorRef,
              private i18nService: NzI18nService
  ) {
    const formControls = {
      formLayout: ['vertical'],
      successSnapshots: [this.snapshots, Validators.required],
      successPlans: [this.successPlans, Validators.required],
      recipientsList: [this.recipients, Validators.required],
      subject : ["", Validators.required],
      body : "",
    };
    this.shareConfigForm = this._fb.group({...formControls});

  }

  ngOnInit() {
    const featureFlags = this.env.gsObject.featureFlags;
    this.ignoreInactive = featureFlags.SS_HA_ENABLEMENT === 'ENABLED'?  true: false;
    this.selectedSS = this.snapshot;
    this.selectedSSName = this.selectedSS ? this.selectedSS.name : '';
    this.slideDeckTitle = this.selectedSSName;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.snapshot && !isEmpty(changes.snapshot.currentValue)) {
      this.selectedSS = this.snapshot;
      this.selectedSSName = this.selectedSS ? this.selectedSS.name : '';
      this.slideDeckTitle = this.selectedSSName;
      this.cdr.detectChanges();
    }
    if (changes && changes.successPlans) {
      this.cdr.detectChanges();
    }
  }

  onSearch(value: string): void {

    let payload = {
      "select": [
        "name",
        "gsid",
        "email"
      ],
      "where": {
        "expression": "(A OR B) AND C AND D",
        "conditions": [
          {
            "alias": "A",
            "name": "Name",
            "operator": "CONTAINS_CS",
            "value": [
              value
            ]
          },{
            "alias": "B",
            "name": "Email",
            "operator": "CONTAINS_CS",
            "value": [
              value
            ]
          },
          {
            "alias": "C",
            "name": "IsActiveUser",
            "operator": "EQ",
            "value": [
              true
            ]
          },
          {
            "alias": "D",
            "name": "SystemType",
            "operator": "EQ",
            "value": [
              "Internal"
            ]
          }
        ]
      },
      "limit": 10,
      "objectName": "gsuser"
    }
   if (value.length >= 3) {
     this.isLoading = true;
     this.c360Service.getGsUsersData(payload).subscribe((data) =>{
       this.recipients = data.data.records;
       this.isLoading = false;
     })
   }
  }

  isNotSelected(value: any): boolean {
    let user = this.selectedUser.find((obj) => obj.name.toUpperCase() === value.name.toUpperCase());
    if (user) {
      this.recipients = this.recipients.filter(option =>  option.name.toUpperCase() !== value.name.toUpperCase())
      return false;
    } else {
      return true;
    }
  }

  ngAfterViewChecked(){
    this.cdr.detectChanges();
  }

  onAction(type) {
    switch (type) {
      case 'SHARE' :
        let subject = this.shareConfigForm.get('subject').value;
        let notes = this.shareConfigForm.get('body').value;
        let successSnapshots = this.shareConfigForm.get('successSnapshots').value;
        let successPlans = this.shareConfigForm.get('successPlans').value;
        let isSpCheckRequired = this.selectedSS.successplanPresent ? this.selectedSP ? true : false : true;
        let shareWithRequired = this.selectedSS.storageType === 'S3' ? this.selectedUser.length > 0 ? true : false : true;
        if (!successPlans) {
          this.shareConfigForm.get('successPlans').markAsDirty()
          this.shareConfigForm.get('successPlans').markAsTouched()
          this.shareConfigForm.get('successPlans').markAsPristine()
          this.shareConfigForm.get('successPlans').markAllAsTouched();
          this.cdr.detectChanges();
        }

        if (successSnapshots && isSpCheckRequired && subject && shareWithRequired) {
          this.action.emit({type: 'LOADING'});
          const instance: any = this.env.instanceDetails;
          let payload = {
            "sourceType": this.env.hostDetails.type ===  "GAINSIGHT" || this.env.gsObject.hybridHostType === "SALESFORCE"? 'MDA' : 'SFDC',
            "namespacePrefix": instance && instance.packageNS  ? instance.packageNS.replace(/_/g, '') : "",
            "accountId": this.ctx.cId,
            "accountName": this.ctx.companyName,
            "shareWith": this.selectedUser,
            "subject": subject,
            "notes": notes
          }

          if (this.selectedSP) {
            payload['spId'] = this.selectedSP.id;
            payload['spName'] = this.selectedSP.name;
          }

          if (this.showEntity === 'RELATIONSHIP') {
            payload["relationshipId"] = this.ctx.rId;
            payload["relationshipName"] = this.ctx.relationshipName;
          }

          if (this.selectedSS.storageType !== 'S3') {
            payload = {...payload, ...{destination: 'GOOGLE_DRIVE',googleDriveDetails: {gsUserId:this.getGSUSerId(),folderId: this.selectedFolderId} } };
          }
          this.c360Service.shareSS(payload,this.selectedSS.ssId, this.selectedSS.storageType).subscribe((data) => {
            this.action.emit({type, success: data.success, data: data, storageType: this.selectedSS.storageType});
            this.cdr.detectChanges();
          });
        } else {
          // this.toastMessageService.add(this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.ENTER_ALL_FIELD'),null,'', { duration: 3000 , horizontalPosition: 'start'})        }
          this.c360Service.createNotification('info', this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.ENTER_ALL_FIELD'),{ duration: 3000} ) };
          this.cdr.detectChanges();
        break;
      case 'CANCEL' :
        this.action.emit({type})
        break;
    }
  }

  public getGSUSerId() {
    const gsUserId = this.env.gsObject.userConfig && this.env.gsObject.userConfig.user ? this.env.gsObject.userConfig.user.id : '';
    return gsUserId;
  }

  onFieldSelected(event) {
    if (!this.firstTime) {
      this.selectedSS = event;
      const payload: any = ["relationship", "successplan"];
      this.sPReportPresent = false;
      this.rShipReportPresent = false;
      this.c360Service.checkForSPAndRelationshipAccess(payload, this.selectedSS.ssId).subscribe((response: any) => {
        if(response.success) {
          this.sPReportPresent = response.data.successplan;
          this.rShipReportPresent = response.data.relationship;
        }
        if ((!this.sPAccessCheck && this.sPReportPresent) && (!this.rShipAccessCheck && this.rShipReportPresent)) {
          this.isShareDisabled = true;
          // this.toastMessageService.add(this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_AND_RELATIONSHIPS_REPORTS'), MessageType.INFO, '', {duration: 5000});
          this.c360Service.createNotification('info', this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_AND_RELATIONSHIPS_REPORTS'),{ duration: 5000} );
        } else if ((!this.sPAccessCheck && this.selectedSS.successplanPresent) && (!this.rShipAccessCheck && this.rShipReportPresent)) {
          this.isShareDisabled = true;
          // this.toastMessageService.add(this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_AND_RELATIONSHIPS_REPORTS'), MessageType.INFO, '', {duration: 5000});
          this.c360Service.createNotification('info', this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_AND_RELATIONSHIPS_REPORTS'),{ duration: 5000} )
        } else if (!this.rShipAccessCheck && this.selectedSS.entity === 'Relationship') {
          this.isShareDisabled = true;
          // this.toastMessageService.add(this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_RELATIONSHIPS_AS_ENTITY'), MessageType.INFO, '', {duration: 5000});
          this.c360Service.createNotification('info', this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_RELATIONSHIPS_AS_ENTITY'),{ duration: 5000} )
        } else if (!this.sPAccessCheck && this.selectedSS.successplanPresent) {
          this.isShareDisabled = true;
          this.c360Service.createNotification('info', this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SP_ACCESS_REQUIRED'),{ duration: 5000} )
          // this.toastMessageService.add(this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.SP_ACCESS_REQUIRED'), MessageType.INFO, '', {duration: 5000});
          this.c360Service.createNotification('info', this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_RELATIONSHIPS_AS_ENTITY'),{ duration: 5000} )
        } else if(!this.sPAccessCheck && this.sPReportPresent) {
          this.isShareDisabled = true;
          // this.toastMessageService.add(this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_REPORTS'), MessageType.INFO, '', {duration: 5000});
          this.c360Service.createNotification('info', this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_SP_REPORTS'),{ duration: 5000} )
        } else if(!this.rShipAccessCheck && this.rShipReportPresent) {
          this.isShareDisabled = true;
          this.c360Service.createNotification('info', this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_RELATIONSHIP_REPORTS'),{ duration: 5000} )
          // this.toastMessageService.add(this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.NO_ACCESS_TO_RELATIONSHIP_REPORTS'), MessageType.INFO, '', {duration: 5000});
        } else {
          this.isShareDisabled = false;
          this.selectedSSName = this.selectedSS ? this.selectedSS.name : '';

          if (this.selectedSS && this.selectedSS.successplanPresent && this.successPlans.length === 0) {
            const id = this.ctx.pageContext === 'C360' ? this.ctx.cId : this.ctx.rId;
            this.c360Service.getSuccessPlans(this.selectedSS.entity, id).subscribe((successPlans) => {
              this.isSpCall = true;
              this.successPlans = successPlans.data;
              this.cdr.detectChanges();
            });
          }

          if (this.selectedSS && this.selectedSS.storageType === 'S3') {
            this.shareConfigForm.get('subject').markAsPristine();
          } else if (this.selectedSS && this.selectedSS.storageType === 'GOOGLE_DRIVE'){
            this.checkForAuthentication(true)
          }
          this.cdr.detectChanges();
        }
      });
    } else {
      this.firstTime = false;
      this.isSpCall = true;
    }
  }

  onSPSelected(e) {
    this.selectedSP = e;
  }

  onSSAction(action) {
    switch (action.type) {
      case 'SELECT_FOLDER':
        this.selectedFolderId = action.payload.selectedFolder ? action.payload.selectedFolder.id: null;
        break;
      case 'DEFAULT_FOLDER':
        this.selectedFolderId = action.payload;
        this.foldersLoaded = true;
        break;
      case 'CREATE_NEW_FOLDER':
        this.selectedFolderId = action.payload.id;
        break;
    }
  }

  checkForAuthentication(checkAuth) {
    // this.isAuthenticated = true;
    // this.visible = true;
    this.c360Service.checkAuthentication().subscribe((response) => {
      if (response.data && response.data.exists) {
        this.isAuthenticated = true;
      } else if(response.data && response.data.authorizationUrl && checkAuth) {
        const popup =  window.open(response.data.authorizationUrl, '_blank', "toolbar=yes,scrollbars=yes,resizable=yes,top=300,left=300,width=500,height=600");
        const popupTick = setInterval(() => {
          if (popup && popup.closed) {
            clearInterval(popupTick);
            this.checkForAuthentication(false);
          } else if (!popup) {
            clearInterval(popupTick)
          }
        }, 500);
      } else {
          this.c360Service.createNotification('error', this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.AUTHENTICATION_FAILED'),{ duration: 5000} )}
        // this.toastMessageService.add(this.i18nService.translate('360.csm.SUCCESS_SNAPSHOT_EXPORT_MESSAGES.AUTHENTICATION_FAILED'), MessageType.ERROR, null, { duration: 5000, horizontalPosition: 'start' });      }
    })
  }
}
