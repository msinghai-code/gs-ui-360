import { Component, OnInit, Inject } from "@angular/core";
import { ISection } from '@gs/cs360-lib/src/common';
import { each, includes, isEmpty, forEach } from "lodash";
import {
	HEIGHTS,
	DYNAMIC_PARAMS_REGEX,
	EmbedPageConfig,
	EmbedPageGlobalFields,
	ParamInfo,
	ParamTypes,
	QueryParam
} from "@gs/cs360-lib/src/common";
import { DomSanitizer } from "@angular/platform-browser";
import {HttpProxyService} from "@gs/gdk/services/http";
import { CONTEXT_INFO, ICONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import { DataTypes } from '@gs/cs360-lib/src/common';
import { UserMetaService } from '@gs/gdk/services/user-meta';
import { EnvironmentService } from "@gs/gdk/services/environment";

@Component({
  selector: "gs-csm-embed-page",
  templateUrl: "./csm-embed-page.component.html",
  styleUrls: ["./csm-embed-page.component.scss"],
})

export class CsmEmbedPageComponent implements OnInit {

	pageURL: any;
	section: ISection;
	_queryParams = [];
	height;
	error = false;
	_fieldsDataSet: any;
	loading = false;

	constructor(
		private sanitizer: DomSanitizer,
		private http: HttpProxyService,
		@Inject("envService") private env: EnvironmentService,
		@Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
		private userMeta: UserMetaService
	) {}

	ngOnInit() {
		this.buildUrl();
	}

	isSessionValidatorEnabled() {
    const featureFlags = this.env.gsObject.featureFlags;
    return featureFlags && featureFlags['CUSTOMER_GOAL_ECOSYSTEM_INTEGRATION'];
  }

	private async buildUrl() {
		let urlDetails: EmbedPageConfig = this.section.config;
		if(!urlDetails) {
			this.error = true;
			return;
		}
		let pageURL: any = urlDetails.url;
		if(urlDetails.heightFormat === "px") {
			this.height = urlDetails.height ? urlDetails.height : HEIGHTS.DEFAULT_PX_HEIGHT;
		} else {
			this.height = urlDetails.height + "%";
		}
		if(urlDetails.includeSessionValidator && this.isSessionValidatorEnabled()) {
			const sessionValidator = await this.getSessionValidator();
			if(sessionValidator) {
				urlDetails.queryParams.push({
					id: 'sessionId',
					type: 'single',
					params: [{ id: 'sessionIdParam', name: 'x-gs-session-validator', selectedValue: sessionValidator}]
				})
			}
		}

		if (urlDetails.queryParams.length) {
			this.setModifiedURL(urlDetails);
		} else {
			this.pageURL = this.sanitizer.bypassSecurityTrustResourceUrl(pageURL);
		}
	}

	private async getSessionValidator() {
		const userMeta = await this.userMeta.getUserMeta();
		return userMeta && userMeta.sessionValidator;
	}

	private setModifiedURL(urlDetails: EmbedPageConfig) {
		this._queryParams = urlDetails.queryParams as QueryParam[];
		const fieldsMap: any = [];
		forEach(this._queryParams, (param: QueryParam) => {
			forEach(param.params, (innerParam?: ParamInfo) => {
				if (innerParam.selectedField && !includes(EmbedPageGlobalFields, innerParam.selectedField.fieldName)) {
					fieldsMap.push(innerParam.selectedField.fieldName);
				}
			});
		});
		if (!isEmpty(fieldsMap)) {
			this.loading = true;
			this.getQueryParams(fieldsMap).subscribe((data) => {
				// Showing loader for extra 1000ms because page in the iframe will take some time to load
				setTimeout(() => {
					this.loading = false;
				}, 1000);
				if (data.data) {
					this._fieldsDataSet = data.data;
					this.pageURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.addParams(urlDetails.url));
				}
			});
		} else {
			this.pageURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.addParams(urlDetails.url));
		}
	}

	private constructURLForPathParams(pageURL: string, param: QueryParam, value: any) {
		return pageURL.replace("${" + param.params[0].name + "}", value);
	}

	private getQueryParams(columns) {
		// const objectName = Cs360ContextUtils.getBaseObjectName(this.ctx);
		const objectName = this.ctx.baseObject;
		let query = {
			select: columns,
			where: {
				conditions: [
				{
					name: "Gsid",
					alias: "A",
					// value: [Cs360ContextUtils.getUniqueCtxId(this.ctx)],
					value: [this.ctx[this.ctx.uniqueCtxId]],
					operator: "EQ",
				},
				],
				expression: "A",
			},
			objectName
		};
		return this.http.post(`v2/queries/${objectName}`, query);
	}

	private constructBundledJSON(members: any[]) {
		let groupMemberVal: any = "";
		let finalVal;
		forEach(members, (gMember?: ParamInfo) => {
			groupMemberVal += groupMemberVal ? encodeURI(",") : "";
			groupMemberVal += encodeURI('"') + gMember.name + encodeURI('":"') + "";
			groupMemberVal += finalVal = this.readValueFromSource(gMember);
			groupMemberVal += encodeURI('"');
		});
		finalVal = encodeURI("{") + "" + groupMemberVal + "" + encodeURI("}");
		return finalVal;
	}

	private readValueFromSource(paramInfo?: ParamInfo) {
		let finalVal;
        if (paramInfo.selectedField) {
            if(this._fieldsDataSet && this._fieldsDataSet.records[0] && this._fieldsDataSet.records[0][paramInfo.selectedField.fieldName] !== undefined) {
                if(paramInfo.selectedField.dataType === DataTypes.PICKLIST || paramInfo.selectedField.dataType === DataTypes.MULTISELECTDROPDOWNLIST) {
                    finalVal = this._fieldsDataSet.records[0][paramInfo.selectedField.fieldName + "_PicklistLabel"];
                } else {
                    finalVal = this._fieldsDataSet.records[0][paramInfo.selectedField.fieldName];
                }
            } else if (this.extractValue(this.env.gsObject, paramInfo.selectedField.fieldName)) {
                finalVal = this.extractValue(this.env.gsObject,paramInfo.selectedField.fieldName);
            }
        } else {
            finalVal = paramInfo.selectedValue;
        }
				let basePageURL = this.section && this.section.config && this.section.config.url || '';
				if (basePageURL.includes("tableau")) {
					finalVal = finalVal.replace(/,/g, "%2c");
					return finalVal;
				} else {
					return encodeURIComponent(finalVal);
				}
	}

	private extractValue(dataSet, KeyToRead) {
		try {
			if (KeyToRead === "userConfig.gsUserEmail") {
				return dataSet.userConfig.emailId;
			} else if (KeyToRead === "userConfig.gsUserName") {
				return dataSet.userConfig.user.name;
			} else if (KeyToRead === "userConfig.gsUserId") {
				return dataSet.userConfig.user.id;
			} else {
				return null;
			}
		} catch (e) {
			return null;
		}
	}

	private addParams(pageURL: string) {
		forEach(this._queryParams, (param: QueryParam) => {
      const paramName = param.type === ParamTypes.Bundled ? param.name : param.params[0].name;
      let finalVal: any;
      if (param.type === ParamTypes.Bundled) {
        finalVal = this.constructBundledJSON(param.params);
      } else {
				finalVal = this.readValueFromSource(param.params[0]);
      }
      if(DYNAMIC_PARAMS_REGEX.test(pageURL) && pageURL.includes(paramName)) {
        pageURL = finalVal ? pageURL.replace("${" + paramName + "}", finalVal) : pageURL;
      } else {
        const urlSegment = paramName || finalVal ? paramName + '=' + finalVal + '' : "";
        let url = `${pageURL.indexOf("?") > -1 ? "&" : "?"}${urlSegment}`
        if(pageURL.includes("#")){
          pageURL =  pageURL.replace("#", `${url}#`);
        } else {
          pageURL = urlSegment ? pageURL + url : pageURL;
        }
      }
    });
		return pageURL;
	}
}
