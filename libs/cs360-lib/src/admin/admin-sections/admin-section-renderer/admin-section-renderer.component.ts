import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import { StateAction } from '@gs/gdk/core';
import { AdminSectionProviderRegistry } from '../admin-section-registry';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { ISection } from '@gs/cs360-lib/src/common';
import { AbstractSectionRenderer } from '@gs/cs360-lib/src/common';
import { SECTION_EVENTS } from '@gs/cs360-lib/src/common';
import { AdminSectionRendererService } from "./admin-section-renderer.service";
import {LazyLoaderService} from "@gs/gdk/services/lazy";

@Component({
  selector: 'gs-admin-section-renderer',
  template: ''
})
export class AdminSectionRendererComponent extends AbstractSectionRenderer implements OnInit {

  @Input() section: ISection;
  @Input() properties: any;
  @Output() changes = new EventEmitter<StateAction>();

  protected loader: boolean = true;
  public sectionInstance : any;
  constructor(protected elementRef: ElementRef,
              protected renderer: Renderer2,
              protected cfr: ComponentFactoryResolver,
              @Inject(ADMIN_CONTEXT_INFO) public ctx: IADMIN_CONTEXT_INFO,
              protected viewContainerRef: ViewContainerRef,
              private adminSecRenderService: AdminSectionRendererService,
              protected lazyLoader: LazyLoaderService) {
    super(elementRef, renderer, cfr, viewContainerRef, ctx, AdminSectionProviderRegistry, lazyLoader);
  }

  ngOnInit(): void {
    const options = this.getSectionOptions();
    // Assigning the admin component class based on context and section type
    const baseSectionComponentClass =
        this.adminSecRenderService.getComponentClass(this.ctx.pageContext, options.sectionType);
    this.loadSection(options, baseSectionComponentClass).then((sectionInstance) => {
      // this.changes.emit({ type: SECTION_EVENTS.SECTION_LOAD_SUCCESS, payload: "" });
      if (sectionInstance) {
        // Do nothing for now
        this.sectionInstance = sectionInstance;
        this.changes.emit({ type: SECTION_EVENTS.SECTION_LOAD_SUCCESS, payload: "" });
      } else {
        this.loader = false;
        this.changes.emit({ type: SECTION_EVENTS.SECTION_LOAD_FAILED, payload: "" });
      }
    }, (e) => {
      this.loader = false;
    });
  }

  getSectionOptions(): any {
    return this.section;
  }

   // This code is annoying to the face !!
   // Commenting for now 
  // sectionComponentEventHandler(evt: StateAction): void {
  //   const { type } = evt;
  //   switch (type) {
  //     case SECTION_EVENTS.SECTION_INIT:
  //     case SECTION_EVENTS.WIDGET_INITIALIZED:
  //       this.loader = false;
  //       break;
  //     case SECTION_EVENTS.SECTION_LOAD_SUCCESS:
  //     case SECTION_EVENTS.WIDGET_LOADED:
  //       this.section.isLoaded = true;
  //       this.loader = false;
  //       this.changes.emit(evt);
  //       break;
  //     case SECTION_EVENTS.SECTION_LOAD_FAILED:
  //       this.loader = false;
  //       break;
  //     case SECTION_EVENTS.SECTION_LOAD_TIMEOUT:
  //       this.loader = false;
  //       break;
  //     case SECTION_EVENTS.SECTION_LOAD_INPROGRESS:
  //       break;
  //     case SECTION_EVENTS.SECTION_REFRESH:
  //       break;
  //     case SECTION_EVENTS.SECTION_UNLOAD:
  //       break;
  //     default: null
  //   }
  // }

  getSectionTimeout() { }

}
