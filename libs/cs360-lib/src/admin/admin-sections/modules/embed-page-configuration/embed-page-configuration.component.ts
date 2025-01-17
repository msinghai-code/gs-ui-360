import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ISection } from '@gs/cs360-lib/src/common';
import { SubSink } from 'subsink';
import { forEach, each, cloneDeep, findIndex, pick } from 'lodash';
import { extraSpaceValidator } from '@gs/gdk/utils/common';
import { MessageType } from '@gs/gdk/core/types/core.interface';
import { DescribeService } from "@gs/gdk/services/describe";
import { MDA_HOST } from '@gs/cs360-lib/src/common';
import { QueryParam, ParamTypes, ParamInfo, DYNAMIC_PARAMS_REGEX, EMBED_PAGE_MESSAGES, HEIGHTS, EmbedPageFieldSaveProperties, EmbedPageConfig } from '@gs/cs360-lib/src/common';
import { DataTypes } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import { CS360Service } from '@gs/cs360-lib/src/common';
import { NzI18nService } from '@gs/ng-horizon/i18n';
import { TranslocoService } from '@ngneat/transloco';
import { EnvironmentService } from '@gs/gdk/services/environment';

@Component({
  selector: 'gs-embed-page-configuration',
  templateUrl: './embed-page-configuration.component.html',
  styleUrls: ['./embed-page-configuration.component.scss']
})
export class EmbedPageConfigurationComponent implements OnInit, OnDestroy {

  embedPageForm: FormGroup;
  config: EmbedPageConfig;
  section: ISection;
  helpText = "Note: Use ${} notation to refer parameters in the URL";
  queryParams: QueryParam[] = [{
    type: ParamTypes.Single,
    id: "single_0",
    params: [<ParamInfo>{
      name: "",
      id: "single_0"
    }]
  }];
  selectFieldOptionGroups: any[];
  paramTypes = ParamTypes;
  originalURL= "";
  constants = HEIGHTS;
  container_min_height;
  container_max_height;
  min_height;
  max_height;

  private subs = new SubSink();
  changesMade = false;

  showSessionValidator = false;

  constructor(private fb: FormBuilder, 
    @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
    private c360Service: CS360Service,
    private _ds : DescribeService,
    private i18nService: NzI18nService,
    private translocoService: TranslocoService,
    @Inject('envService') private _env: EnvironmentService,
  ) {
    const featureFlags = this._env.gsObject.featureFlags;
    this.showSessionValidator = featureFlags && featureFlags['CUSTOMER_GOAL_ECOSYSTEM_INTEGRATION'];
  }

  ngOnInit() {
    this.config = this.section.config || {url: "", height: HEIGHTS.DEFAULT_PER_HEIGHT, heightFormat: "%"};
    if(this.config && this.config.queryParams && this.config.queryParams.length) {
      this.queryParams = this.config.queryParams;
    }
    this.originalURL = this.config.url;
    this.embedPageForm = this.fb.group({
      url: [this.config.url, { validators: [Validators.required, extraSpaceValidator], updateOn: 'blur'}],
      heightFormat: [this.config.heightFormat || "%"],
      height: [this.config.height, { validators: [Validators.required, Validators.min(HEIGHTS.MIN_HEIGHT(this.config.heightFormat)), Validators.max(HEIGHTS.MAX_HEIGHT(this.config.heightFormat))], updateOn: 'blur'}],
      urlPreview: "",
      includeSessionValidator: [!!this.config.includeSessionValidator]
    });
    this.updateHeightText();
    if(this.section.isDetachSectionPreview) {
      this.embedPageForm.disable();
    }
    this.subscribeToValueChanges();
    this.setUrlPreview(false);
    this.setSelectedFieldGroups();
  }

  isConfigurationChanged() {
    return this.embedPageForm.dirty || this.changesMade;
  }

  private subscribeToValueChanges() {
    this.subs.add(this.embedPageForm.get("url").valueChanges.subscribe(value => {
      this.updateUrl();
      this.setUrlPreview();
    }));
    this.subs.add(this.embedPageForm.get("heightFormat").valueChanges.subscribe(value => {
      const heightValue = this.embedPageForm.get("height").value;
      if(value === "%") {
        if(heightValue > HEIGHTS.DEFAULT_PER_HEIGHT || !heightValue) {
          this.embedPageForm.get("height").setValue(HEIGHTS.DEFAULT_PER_HEIGHT);
        }
      }
      this.embedPageForm.get('height').setValidators([Validators.min(HEIGHTS.MIN_HEIGHT(value)), Validators.max(HEIGHTS.MAX_HEIGHT(value))]);
      this.embedPageForm.get('height').updateValueAndValidity();
      this.updateHeightText();
    }));
  }

  updateHeightText() {
    this.container_min_height = this.constants.MIN_HEIGHT(this.embedPageForm.get("heightFormat").value);
    this.container_max_height =  this.constants.MAX_HEIGHT(this.embedPageForm.get("heightFormat").value)
    this.min_height = this.i18nService.translate('360.admin.embed_page.min_height' , {value: this.container_min_height});
    this.max_height = this.i18nService.translate('360.admin.embed_page.max_height', {value: this.container_max_height});
  }

  private updateUrl() {
    const url = this.embedPageForm.get("url").value;
    if(url.length) {
      if(DYNAMIC_PARAMS_REGEX.test(url)) {
        const pathParams = url.match(/\${.*?}/ig);
        forEach(pathParams, (pathParam: string) => {
          const paramName = pathParam.toString().substring(2, pathParam.length -1);
          const found = this.queryParams.find(p => p.type === ParamTypes.Single && p.params[0].name === paramName);
          if(!found) {
            this.addParam({name: paramName});
          }
        });
      }
    }
  }

  private async setSelectedFieldGroups() {
    // const objName = Cs360ContextUtils.getBaseObjectName(this.ctx);
    const objName = this.ctx.baseObject;
    let resp = await this._ds.getDescribedObject(MDA_HOST, objName, false, false, false, true);
    this.selectFieldOptionGroups = [
      {
        // label:  this.i18nService.translate(Cs360ContextUtils.getTranslatedBaseObjectLabel(this.translocoService, this.ctx)),
        label: this.i18nService.translate(this.ctx.translatedBaseObjectLabel),
        fields: resp.fields.filter(f => ![DataTypes.RICHTEXTAREA, DataTypes.IMAGE].includes(f.dataType.toUpperCase() as any))
      }, 
      //{360.admin.embed_page.global}=Global
      {
        label: this.i18nService.translate('360.admin.embed_page.global'),
        fields: this.getGlobalFieldList()
      }
    ];
  }

  setUrlPreview(markChanged = true) {
    let givenUrl = this.embedPageForm.get("url").value;
    if(!givenUrl) {
      return;
    }
    forEach(this.queryParams, (param: QueryParam) => {
      const paramName = param.type === ParamTypes.Bundled ? param.name : param.params[0].name;
      let finalVal: any;
      if (param.type === ParamTypes.Bundled) {
        finalVal = this.constructBundledJSON(param.params);
      } else {
        finalVal = param.params[0].selectedField ? param.params[0].selectedField.label : param.params[0].selectedValue;
      }
      if(DYNAMIC_PARAMS_REGEX.test(givenUrl) && givenUrl.includes(paramName)) {
        givenUrl = finalVal ? givenUrl.replace("${" + paramName + "}", finalVal) : givenUrl;
      } else {
        const urlSegment = paramName || finalVal ? paramName + '=' + finalVal + '' : "";
        let url = `${givenUrl.indexOf("?") > -1 ? "&" : "?"}${urlSegment}`
        if(givenUrl.includes("#")){
          givenUrl =  givenUrl.replace("#", `${url}#`);
        } else {
          givenUrl = urlSegment ? givenUrl + url : givenUrl;
        }
      }
    });
    this.embedPageForm.get("urlPreview").setValue(givenUrl);
    if(markChanged) {
      this.changesMade = true;
    }
  }

  private constructBundledJSON(members: ParamInfo[]) {
		let finalVal = "";
		let groupMemberVal: any = '';
		forEach(members, (gMember?: ParamInfo) => {
      if(!gMember.name) {
        return;
      }
			groupMemberVal += groupMemberVal ? ',' : '';
			groupMemberVal += '"' + gMember.name + '":"' + '';
			groupMemberVal += finalVal = gMember.selectedField ? gMember.selectedField.label : gMember.selectedValue
			groupMemberVal += '"';
		});
		finalVal = '{' + '' + groupMemberVal + '' + '}';
		return finalVal;
	}
//{360.admin.embed_page.user_name}=User Name
//{360.admin.embed_page.user_id}=User Id
//{360.admin.embed_page.user_email}="User Email
  private getGlobalFieldList():Object {
		let globalFields:any = {
			"userConfig.gsUserName":  this.i18nService.translate('360.admin.embed_page.user_name'),
			"userConfig.gsUserId":    this.i18nService.translate('360.admin.embed_page.user_id'),
			"userConfig.gsUserEmail": this.i18nService.translate('360.admin.embed_page.user_email')
		};

		const globalFieldList:any = [];
		each(globalFields, function (value?:any, key?:any) {
			globalFieldList.push({
        "fieldName":key,
        "label":value,
        "dataType":"STRING",
				"objectName":"Global",
        "objectLabel":"Global",
        "options":[]
      });
		});
		return globalFieldList;
	}

  onDeleteParam(param: QueryParam, innerParam?: ParamInfo) {
    if(innerParam) {
      param.params.splice(param.params.indexOf(innerParam), 1);
      return;
    } else {
      let index = this.queryParams.indexOf(param);
      if(index === -1) {
        index = findIndex(this.queryParams, (p: QueryParam) => p.params[0].id === param.id);
      }
      this.queryParams.splice(index, 1);
    }
    this.setUrlPreview();
  }

  onSelectedFieldChange(event, param: ParamInfo) {
    let found;
    this.selectFieldOptionGroups.forEach(grp => {
      if(found) {
        return;
      } else {
        found = grp.fields.find(f => f.fieldName === event);
      }
    });
    param.selectedField = found;
    this.setUrlPreview();

  }

  onParamChange() {
    this.setUrlPreview();
  }

  private isFirstParamNotChanged() {
    return this.queryParams.length === 1 && this.queryParams[0].type === ParamTypes.Single && !this.queryParams[0].params[0].name;
  }

  private addParam(paramInfo, type = ParamTypes.Single, onAddClick?: boolean) {
    if(this.isFirstParamNotChanged()) { 
      if(onAddClick && type === ParamTypes.Bundled) {
        this.queryParams.pop();
      } else {
        this.queryParams[0].params[0].name = paramInfo.name;
        return this.queryParams[0];
      }
    }
    let param;
    if(type === ParamTypes.Bundled) {    
      param = {
        type: ParamTypes.Bundled,
        id: "bundled_" + this.queryParams.length,
        name: "",
        params: [
          {
            id: "bundled_param_0",
            name: paramInfo.name || ""
          }
        ]
      };
    } else {
      param = {
        type: ParamTypes.Single,
        id: "single_" + this.queryParams.length,
        params: [{
          id: "single_" + this.queryParams.length,
          name: paramInfo.name || ""
        }]
      };
    }
    this.queryParams.push(param);
    return param;
  }

  onAddParam(type: string, param?: QueryParam) {
    if(param) {
      param.params.push({
        id: "bundled_param" + param.params.length,
        name: ""
      });
      return;
    }
    this.addParam({}, type as ParamTypes, true);

    this.changesMade = true;
  }

  private submitForm(): void {
    for (const i in this.embedPageForm.controls) {
      this.embedPageForm.controls[i].markAsDirty();
      this.embedPageForm.controls[i].updateValueAndValidity();
    }
  }

  validate() {
    this.submitForm();
    if(!this.embedPageForm.valid && !this.embedPageForm.disabled) {
      return false;
    }
    this.setUrlPreview();
    if(DYNAMIC_PARAMS_REGEX.test(this.embedPageForm.get("urlPreview").value)) { 
      // this.toastMessageService.add(EMBED_PAGE_MESSAGES.INVALID_PARAMS, MessageType.ERROR);
      this.c360Service.createNotification('error', this.i18nService.translate(EMBED_PAGE_MESSAGES.INVALID_PARAMS),'');
      return false;
    }
    return true;
  }

  private modifyParams(queryParams: QueryParam[]) {
    return queryParams.map(param => {
      param.params = param.params.map(bundleParam => {
        if(!bundleParam.name) {
          return null;
        }
        if(bundleParam.selectedField) {
          delete bundleParam.selectedValue;
          return {...bundleParam, selectedField: pick(bundleParam.selectedField, EmbedPageFieldSaveProperties)};
        }
        return {...bundleParam};
      });
      param.params = param.params.filter(p => p);
      if(param.params.length) {
        return param;
      }
    })
  }

  toJSON() {
    return {
      ...this.embedPageForm.getRawValue(),
      queryParams: this.modifyParams(cloneDeep(this.queryParams)).filter(param => param)
    };
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
