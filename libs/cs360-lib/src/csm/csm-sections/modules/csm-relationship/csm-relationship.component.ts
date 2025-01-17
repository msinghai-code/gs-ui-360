import {
  Component,
  Inject,
  OnInit
} from '@angular/core';
import {noop, isEmpty} from "lodash";
import {MiniPrefix, PageContext, SectionStateService} from '@gs/cs360-lib/src/common';
import {ICsmRelationshipState} from "./csm-relationship.constants";
import {CsmRelationshipService} from "./csm-relationship.service";
import { EnvironmentService } from "@gs/gdk/services/environment"
import { CONTEXT_INFO, ICONTEXT_INFO, StateAction360 } from '@gs/cs360-lib/src/common';
import { isMini360 } from '@gs/cs360-lib/src/common/cs360.utils';
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-csm-relationship',
  templateUrl: './csm-relationship.component.html',
  styleUrls: ['./csm-relationship.component.scss']
})
export class CsmRelationshipComponent implements OnInit {

  public config: any;
  public componentRef: any;
  public section : any;
  public isMini360: boolean = false;
  public allRelTypes: any;


  constructor(@Inject("envService") private env: EnvironmentService,
              @Inject(CONTEXT_INFO) public ctx: ICONTEXT_INFO,
              private csmRelationshipService: CsmRelationshipService,
              private sectionStateService: SectionStateService,
              private i18nService: NzI18nService) { }

  ngOnInit() {
    this.isMini360 = isMini360(this.ctx);
    this.bootstrapComponent();
    this.csmRelationshipService.stateData.next({state: (<any>this).section.state.state, sectionId: this.section.sectionId});
  }

  private async bootstrapComponent() {
    /// getting formatted relationship types ///
    const items: any[] = [{ id: "ALL", name:  'All', label: this.i18nService.translate('360.csm.360.all_relationship_types') }];
    const relTypes: any = await this.csmRelationshipService.fetchAllRelationshipTypes().toPromise();
    (relTypes || []).forEach((relType: any) => {
      const { Gsid, Name } = relType;

      items.push({
        id: Gsid,
        name: Name,
        label: Name
      })
    });
    this.allRelTypes = items;
    return items;
  }

  public onAction(event: StateAction360) {
      const {type, payload, saveState} = event;
      switch (type) {
          case "PRESERVE_STATE":
          case 'STATE_PRESERVE_COLS':
              this.preserveState(payload);
              break;
          default:
              if (saveState) {
                  this.config = event;
                  this.preserveState({selectedRelType: payload.id});
              }
      }
  }

  private preserveState(payload: ICsmRelationshipState) {
    const moduleName = isMini360(this.ctx)? (MiniPrefix+this.ctx.pageContext).toLowerCase() : this.ctx.pageContext;
    const { sectionId, state, layoutId } = (<any>this).section;
    const referenceId: string = `${layoutId}_${sectionId}`;
    const newStateObj = {...state.state, ...payload,
        columnsState: state.state ? {...state.state.columnsState, ...payload.columnsState} : payload.columnsState,
    }
    this.sectionStateService
        .saveState({
          referenceId,
          state: newStateObj,
          moduleName: moduleName,
          entityType: this.ctx.pageContext === PageContext.C360 ? 'Company' : 'Relationship',
          gsEntityId: "default"
        })
        .subscribe(noop);

    /* need to reassign state else next state call happens on old state data, and changes are overidden */
    this.section.state = {...this.section.state, state: newStateObj};
    this.csmRelationshipService.stateData.next({state: (<any>this).section.state.state, sectionId: this.section.sectionId});
  }

}
