  import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import {ICONTEXT_INFO, ISection, isMini360, MiniPrefix} from '@gs/cs360-lib/src/common';
import { AbstractSectionRenderer } from '@gs/cs360-lib/src/common';
import { StateAction } from '@gs/gdk/core';
import { SECTION_EVENTS } from '@gs/cs360-lib/src/common';
import { SectionRendererService } from '@gs/cs360-lib/src/common';
import { CSMSectionProviderRegistry } from '../csm-section-registry';
import { SectionStateService } from '@gs/cs360-lib/src/common';
import { StateProviderRegistry } from "@gs/cs360-lib/src/common";
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { SubSink } from 'subsink';
  import {CsmSectionRendererService} from "./csm-section-renderer.service";
  import {LazyLoaderService} from "@gs/gdk/services/lazy";

@Component({
  selector: 'gs-csm-section-renderer',
  template: '',
  styles: [
      `
      :host {
        display: block;
        height: 100%;
      }
    `
  ]
})
export class CsmSectionRendererComponent extends AbstractSectionRenderer implements OnInit, OnDestroy {

  @Input() section: ISection;
  @Input() moduleConfig = null;
  @Input() render: boolean= false;
  @Output() changes = new EventEmitter<StateAction>();

  protected loader: boolean = true;
  private subs = new SubSink();

  constructor(protected elementRef: ElementRef,
              protected renderer: Renderer2,
              protected cfr: ComponentFactoryResolver,
              protected viewContainerRef: ViewContainerRef,
              private sectionRendererService: SectionRendererService,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
              private sectionStateService: SectionStateService,
              private csmSectionRenderService: CsmSectionRendererService,
              protected lazyLoader: LazyLoaderService
              ) {
    super(elementRef, renderer, cfr, viewContainerRef, ctx, CSMSectionProviderRegistry, lazyLoader);
  }

  ngOnInit(): void {
    // Assigning the csm component class based on context and section type
    const baseSectionComponentClass =
        this.csmSectionRenderService.getComponentClass(this.ctx.pageContext, this.section.sectionType);
    if(this.render) {
      this.loadSection(this.section, baseSectionComponentClass, this.moduleConfig);
      return;
    }
    
    this.subs.add(this.sectionRendererService.getRenderSubjectAsObservable().subscribe((sectionToRender: ISection) => {
      if (sectionToRender && this.section.sectionId === sectionToRender.sectionId) {
        this.section.isLoaded = true;
        /**
         * Check if section is registered for state management
         * If yes, fetch the state for the current section
         * If no, skip the state call
        **/
        this.checkSectionStateEnablementStatus(this.section)
            .then((state: boolean) => {
              // Associate state with section.
              this.section.state = state && state[0] || {};

              this.loadSection(this.section, baseSectionComponentClass,this.moduleConfig).then((resolved) => {
                // this.changes.emit({ type: SECTION_EVENTS.SECTION_LOAD_SUCCESS, payload: "" });
                if (resolved) {
                  // Do nothing for now
                } else {
                  this.loader = false;
                  this.changes.emit({ type: SECTION_EVENTS.SECTION_LOAD_FAILED, payload: "" });
                }
              }, (e) => {
                this.loader = false;
              });
            });
      }
    }));
  }

  checkSectionStateEnablementStatus(section: any) {
    const moduleName = isMini360(this.ctx)? (MiniPrefix+this.ctx.pageContext).toLowerCase() : this.ctx.pageContext;
    const { sectionId, sectionType, layoutId } = section;
    if(StateProviderRegistry.getSectionStateEnablementStatus(sectionType)) {
      return this.sectionStateService.getState(layoutId, sectionId, moduleName).toPromise();
    } else {
      return new Promise(resolve => resolve(null));
    }
  }

  getSectionTimeout() { }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
