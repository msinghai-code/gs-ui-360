import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import {Constants as TimelineConstants} from "../../../csm-sections/modules/csm-timeline/csm-timeline.constants"
import { EnvironmentService } from '@gs/gdk/services/environment';
import { IS_LEGACY_BROWSER } from '@gs/gdk/utils/common';
import { getCdnPath } from '@gs/gdk/utils/cdn';

@Component({
  selector: 'gs-quick-timeline',
  templateUrl: './quick-timeline.component.html',
  styleUrls: ['./quick-timeline.component.scss']
})
export class QuickTimelineComponent implements OnInit {
  @Output() onAction = new EventEmitter();
  elementTag = 'gs-timeline-ngx-widget-element';
  url: string;
  moduleConfig;
  tgs;
  composerClose = this.onComposerClose.bind(this);
  show = true;

  constructor(
      @Inject("envService") public env: EnvironmentService,
    @Inject(CONTEXT_INFO) public ctx,
    private cdr: ChangeDetectorRef) {
  }

  protected getTimelineRenderConfig() {
    const isR360=(this.ctx.pageContext)===TimelineConstants.R360?true:false;
		const contexts = [
			{
				id: this.ctx.cId,
				obj: TimelineConstants.COMPANY,
				eobj: TimelineConstants.ACCOUNT,
				eid: null,
				esys: TimelineConstants.SFDC,
				lbl: this.ctx.companyName,
        dsp: true,
        base: !isR360,
			}
		];
		if (isR360) {
			contexts.push({
					id: this.ctx.relationshipTypeId,
					obj: TimelineConstants.RELATIONSHIPTYPE,
					eobj: TimelineConstants.RELATIONSHIPTYPE,
					eid: null,
					esys: TimelineConstants.SFDC,
					lbl: null,
					dsp: false,
					base: false
				},
				{
					id: this.ctx.rId,
					obj: TimelineConstants.RELATIONSHIP,
					eobj: TimelineConstants.RELATIONSHIP,
					eid: null,
					esys: TimelineConstants.SFDC,
					lbl: this.ctx.relationshipName,
					dsp: true,
					base: true,
				});
		}
		return {
      meta:{
        contexts: contexts,
        viewContext: {
          id: isR360? this.ctx.rId : this.ctx.cId,
          obj: isR360? TimelineConstants.RELATIONSHIP : TimelineConstants.COMPANY,
          sys: TimelineConstants.GAINSIGHT,
          appVariant: this.ctx.appVariant,
          pageContext: this.ctx.pageContext
        },
        source: isR360? TimelineConstants.R360 : TimelineConstants.CS360,
        formContext: {
          name: isR360? TimelineConstants.RELATIONSHIPTYPE : TimelineConstants.COMPANY,
          id: () => isR360? this.ctx.relationshipTypeId: this.ctx.cId
        } 
      },
      defaultData: {},
      renderOnlyComposer: true
		};
	}

  buildOptions() {
    this.moduleConfig=this.getTimelineRenderConfig();
  }

  async ngOnInit() {
    this.buildOptions();
    const moduleUrl = this.env.gsObject.autonomousUrls ? this.env.gsObject.autonomousUrls['timeline-ngx-widget'] : (await getCdnPath('timeline-ngx-widget'));
    this.url = "https://localhost:4201/main.js";
    // this.url = `${moduleUrl || "https://localhost:4201"}/${IS_LEGACY_BROWSER ? 'main-es5.js' : 'main-es2015.js'}`; //Point to local host if required
  }

  onChanges($event) {
    const type = $event.detail.type;
    switch(type) {
      case "EVENTS_LOADED":
        this.tgs = $event.detail.data.tgs;
        this.tgs.subscribe("COMPOSER_CLOSED", this.onComposerClose, this);
        this.tgs.subscribe("ACTIVITY_SAVE", this.onActivitySave, this);
        break;
    }
  }

  onComposerClose() {
    this.show = false;
    this.cdr.detectChanges();
    this.onAction.emit({type: "CANCEL"});
  }

  onActivitySave() { 
    this.onAction.emit({type: "SAVE"});
  }

  ngOnDestroy() {
    // Unsubscribe after raising event to all subscribers of this event
    setTimeout(() => {
      if(this.tgs) {
        this.tgs.unSubscribe("COMPOSER_CLOSED", this.onComposerClose, this);
        this.tgs.unSubscribe("ACTIVITY_SAVE", this.onActivitySave, this);
      }
    }, 10);
  }

}
