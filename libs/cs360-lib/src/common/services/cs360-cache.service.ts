import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { find, each } from 'lodash';
import { CONTEXT_INFO, ICONTEXT_INFO } from '../context.token';
import { EnvironmentService } from "@gs/gdk/services/environment"
import {SectionRendererService} from "../section/section-renderer/section-renderer.service";

@Injectable({
  providedIn: 'root'
})
export class CS360CacheService {
  public cache: any = {};
  constructor(@Inject("envService") private env: EnvironmentService, private router: Router,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO, private srs: SectionRendererService,) { }

  public updateCache(key: string, data: any) {
    if (!this.cache.hasOwnProperty(key) && !this.cache[key]) {
      this.cache[key] = data;
    }
  }

  public getCacheByKey(key: string): any {
    if (this.cache.hasOwnProperty(key) && this.cache[key]) {
      return this.cache[key];
    }
    return {};
  }

  public getModuleConfig() {
    return this.env.moduleConfig || {};
  }

  public getSectionConfig(value: string) {
    const moduleConfig = this.getModuleConfig();
    const { sections } = moduleConfig;
    return find(sections, (section) => section.sectionId === value || section.sectionType === value);
  }

  public getModuleContextId(ctx?:ICONTEXT_INFO) {
    const moduleConfig = this.getModuleConfig();
    const { layoutData: { layoutResolverDTO } } = moduleConfig;
    // if(ctx && ctx.pageContext === 'R360'){
    //   return layoutResolverDTO.relationshipId;
    // }
    // return layoutResolverDTO.companyId;
    return ctx && layoutResolverDTO[ctx.uniqueIdentifierFieldName];
    //here
  }

  getSectionIdByType(sectionType: string) {
    const moduleConfig = this.getModuleConfig();
    const { sections } = moduleConfig;
    const section = find(sections, (section) => section.sectionType === sectionType);
    return (section && section.sectionId) || null;
  }

  setMetaToSection(sectionId, meta,moduleConfig?) {
    if(!moduleConfig){
      moduleConfig = this.getModuleConfig();
    }
    if (moduleConfig && moduleConfig.sections) {
      each(moduleConfig.sections, (section) => {
        if (section.sectionId === sectionId)
          section.sectionMeta.next(meta);
      });
    }
  }

  navigateToSection(sectionType, config?: any, moduleConfig?: any) {
    if (this.ctx.appVariant === "MINI_360") {
      this.navigateToTab(sectionType, config, moduleConfig, null);
    } else {
      const sectionId = this.getSectionIdByType(sectionType);
      if (sectionId) {
        if (config) {
          this.setMetaToSection(sectionId, config, moduleConfig);
        }
        this.router.navigate([`/${sectionId}`]);
      }
    }
  }

  navigateToTab(sectionType: any, config?: any, moduleConfig?: any, sectionId?: any) {
    // Determine the section ID to use
    const idToUse = sectionId || this.getSectionIdByType(sectionType);

    // If a valid section ID is found and config is provided, set metadata
    if (idToUse && config) {
      this.setMetaToSection(idToUse, config, moduleConfig);
    }

    // Set the active tab with the determined section ID
    if (idToUse) {
      this.srs.setActiveTab(idToUse);
    }
  }


  switchToAssociatedContext(payload,meta){
    Object.keys(payload).forEach((key)=>this.ctx[key] = payload[key]);
    const moduleConfig = this.env.moduleConfig;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    const currentSection = moduleConfig.sections.find((section)=>{
      return section.sectionId === this.router.url.slice(1);
    });
    this.setMetaToSection(currentSection.sectionId,meta);
    this.router.navigateByUrl(`/${currentSection.sectionId}`, {skipLocationChange: true,
      state: {selectedContextTitle: payload.selectedContextTitle}}).then(()=>{
      this.router.routeReuseStrategy.shouldReuseRoute = () => true;
      this.router.onSameUrlNavigation = 'ignore';
    });
  }

}
