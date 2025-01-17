/**
 * created by rpal on 2021-02-23
 */

import { ComponentFactoryResolver, ElementRef, Inject, Renderer2, ViewContainerRef } from '@angular/core';
import { ADMIN_CONTEXT_INFO } from "../../admin.context.token";
import { Cs360ContextUtils } from '../../cs360.context';
import { LazyLoaderService } from "@gs/gdk/services/lazy";
import { AbstractSectionProvider } from '../providers/AbstractSectionProvider';

export abstract class AbstractSectionRenderer {

    abstract getSectionTimeout(): void;

    constructor(
        protected elementRef: ElementRef,
        protected renderer: Renderer2,
        protected cfr: ComponentFactoryResolver,
        protected viewContainerRef: ViewContainerRef,
        @Inject(ADMIN_CONTEXT_INFO) public ctx: any,
        protected sectionProviderRegistry: any,
        protected lazyLoader: LazyLoaderService) { }

    /**
     * Load section in async manner.
     * @param section
     * @param sectionComponentClass
     */
    async loadSection(section: any, sectionComponentClass?: any,moduleConfig?:any) {
        try {
            const sectionPromise: Promise<any> = this.sectionRenderPromise(section, sectionComponentClass,moduleConfig);
            const timeoutPromise: Promise<any> = this.timeoutPromise(section);
            let promises = [sectionPromise];
            if (!!section.timeout) {
                promises.push(timeoutPromise);
            }
            return await Promise.race(promises).finally(() => clearTimeout(section.timerId));
        } catch (e) {
            return e;
        }
    }

    /**
     * Get Promise for Section being rendered
     * @protected
     * @param section
     * @param sectionComponentClass
     */
    protected sectionRenderPromise(section: any, sectionComponentClass?: any,moduleConfig?: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            let compFactory: any;
            let componentClass = null;
            if (sectionComponentClass) {
                componentClass = sectionComponentClass;
                compFactory = this.cfr.resolveComponentFactory(componentClass);
            } else {
                let sectionProvider: any = this.sectionProviderRegistry.getSectionProvider(section.sectionType);
                // Lazy load modules approach
                if (typeof sectionProvider === "string") {
                    compFactory = await this.lazyLoader.load(sectionProvider.toLowerCase());
                } else {
                    if (!sectionProvider) {
                        console.error(`There is no provider for section ${section.sectionType},
                    'Add Provider in libs/cs360-lib/src/' folder
                `);
                        reject(false);
                        sectionProvider = this.sectionProviderRegistry.getEmptySectionProvider();
                    }
                    // Cs360ContextUtils.getUniqueCtxId(this.ctx) is to check whether the context is admin or csm
                    if (!section.configured && this.ctx.uniqueCtxId) {
                        sectionProvider = this.sectionProviderRegistry.getEmptySectionProvider();
                    }
                    /***
                     * Now passing the Page Context to get the respective section views.
                     */
                    componentClass = await sectionProvider.getSectionView(section.sectionType, this.ctx);
                    if (!componentClass) {
                        reject(false);
                        return;
                    }
                    compFactory = this.cfr.resolveComponentFactory(componentClass);
                }

            }
            const ref = this.viewContainerRef.createComponent(compFactory);
            const sectionElement = this.elementRef.nativeElement;
            const sectionInstance = (ref.instance as any);
            try {
                sectionInstance.section = section;
                if(moduleConfig){
                    sectionInstance.moduleConfig = moduleConfig;
                }
                sectionInstance.sectionElement = sectionElement;
                sectionInstance.properties = {};
                ref.changeDetectorRef.detectChanges();
            } catch (e) {
                console.log(e);
            }
            sectionInstance.element = ref.location.nativeElement;
            sectionElement.appendChild(sectionInstance.element);
            resolve(sectionInstance);
        });
    }

    /**
     * Get Timeout promise
     * @param options
     * @protected
     */
    protected timeoutPromise(options: any): Promise<any> {
        return new Promise<any | void>((resolve, reject) => {
            if (!!options.timeout) {
                options.timerId = setTimeout(() => {
                    resolve({});
                    this.elementRef.nativeElement.innerHTML = '';
                }, options.timeout);
            }
        });
    }

}
