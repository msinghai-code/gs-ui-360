import {Component, OnInit, Output, Input, EventEmitter, Inject} from '@angular/core';
import { FormControl } from '@angular/forms';
import { cloneDeep, isEmpty } from "lodash";
import { debounceTime, distinctUntilChanged, filter, map } from "rxjs/operators";
import { CsmRelationshipService } from "../csm-relationship.service";
import { ISection } from '@gs/cs360-lib/src/common';
import { StateAction360 } from '@gs/cs360-lib/src/common';
import {EnvironmentService} from "@gs/gdk/services/environment";
import {NzI18nService} from "@gs/ng-horizon/i18n";

@Component({
  selector: 'gs-relationship-filters',
  templateUrl: './relationship-filters.component.html',
  styleUrls: ['./relationship-filters.component.scss']
})
export class RelationshipFiltersComponent implements OnInit {

  @Input() section: ISection;
  @Input() relTypes;

  @Output() action = new EventEmitter<StateAction360>();

  public searchControl = new FormControl();
  public panels = [
    {
      index: 'REL_TYPES',
      name: this.i18nService.translate('360.csm.relationship_filters.type'),
      disabled: false,
      active: true,
      hidden: false,
      arrow: true,
      data: [],
      originalData: []
    },
    {
      index: 'REPORTS',
      name: this.i18nService.translate('360.csm.relationship_filters.reports'),
      disabled: false,
      active: true,
      hidden: false,
      arrow: true,
      data: [],
      originalData: []
    }
  ];
  public selectedItem: any;
  public loader: boolean = false;

  constructor(private csmRelationshipService: CsmRelationshipService,
              @Inject("envService") public env: EnvironmentService, private i18nService: NzI18nService) { }

  ngOnInit() {
    this.bootstrapComponent();
    this.searchSubscriber();
  }

  private async bootstrapComponent() {
    this.showLoader(true);
    const { config, state } = this.section;
    const { reports = [] } = !isEmpty(config) ? config.reportConfig: {};
    if(reports.length === 0) {
      this.panels.splice(1, 1);
    }
    this.panels = this.panels.map((panel) => {
      if(panel.index === 'REL_TYPES') {
        return {
          ...panel,
          data: this.relTypes,
          originalData: cloneDeep(this.relTypes)
        }
      } else if(panel.index === 'REPORTS') {
        return {
          ...panel,
          data: reports,
          originalData: cloneDeep(reports)
        }
      }

      return panel;
    });
    this.showLoader(false);
    // Get the default selected item or state preserved item.
    const { index, item } = this.getDefaultSelectedItem();
    this.onItemClick({ index }, item, false);
  }

  onChange(_event:any){
    const searchTerm: string = !!_event.target.value ? _event.target.value.trim().toLowerCase(): "";
    this.panels = this.panels.map((panel) => {
      return {
        ...panel,
        data: panel.originalData.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
      }
      return panel;
    });
  }

  searchSubscriber() {
    this.searchControl.valueChanges
        .pipe(
            map(searchTerm => searchTerm.trim()),
            filter(searchTerm => searchTerm.length >=1  || searchTerm.length === 0),
            debounceTime(400),
            distinctUntilChanged(),
        ).subscribe((searchTerm: string) => {
          this.panels = this.panels.map((panel) => {
            return {
              ...panel,
              data: panel.originalData.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
            }
            return panel;
          });
        });
  }

  getDefaultSelectedItem() {
    const { state } = this.section;
    let item = { index: this.panels[0].index, item: this.panels[0].data[0]};
    if(!isEmpty(state) && !isEmpty(state.state)) {
      const { selectedRelType } = state.state;
      const matchedPanel = this.panels.filter(p => {
        const { index, data } = p;
        return data.some(d => d.id === selectedRelType);
      }).map(p => {
        const { index, data } = p;
        return { index, item: data.find(d => d.id === selectedRelType) };
      });

      return matchedPanel && matchedPanel.length ? matchedPanel[0]: item;
    }

    return item;
  }

  onItemClick(panel: any, item: any, emitAction) {
    if(!!this.selectedItem && this.selectedItem.id === item.id) return;
    this.selectedItem = item;
        this.action.emit({
            type: panel.index,
            payload: item,
            saveState: emitAction
    })
  }

  // /**
  //  * show loader based on flags
  //  * @param flag
  //  * @private
  //  */
  private showLoader(flag): void {
    this.loader = flag;
  }

}
