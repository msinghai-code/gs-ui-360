import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { PortfolioWidgetService } from '../portfolio-widget.service';
import {NzI18nService} from "@gs/ng-horizon/i18n";
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'gs-health-score-renderer',
  templateUrl: './health-score-renderer.component.html',
  styleUrls: ['./health-score-renderer.component.scss']
})
export class HealthScoreRendererComponent  implements ICellRendererAngularComp, OnDestroy {

  public params: any;
  public tooltipVisableText: string;
  public data = {
      size:"sm",
      isEditable:false,
      fact: {},
      measureData:{},
  } as any;

  constructor(private portfolioWidgetService: PortfolioWidgetService,public i18nService: NzI18nService,private changeDetectorRef: ChangeDetectorRef) {
  }

  agInit(params: any): void {
    this.params = params.value && params.value.properties ? params.value.properties: {};
      this.portfolioWidgetService.getScorecardSchemeListInfo().subscribe(schemeListInfo => {
          const selectedScheme = schemeListInfo.find(sch => sch.type === (this.params && this.params.schemeType || "NUMERIC"));
          this.data = {...this.data,
              fact : {
                  curScore: this.params.score,
                  curScoreColor: this.params.color,
                  curScoreLabel: this.params.label,
                  trend: this.params.trend,
                  label: this.params.label
              },
              selectedScheme
          };
          this.changeDetectorRef.detectChanges();
      });
    if (this.params.label) {
      this.tooltipVisableText = this.i18nService.translate('360.admin.health_score.label')+' '+ `${this.params.label}`;
    }
    else {
      this.tooltipVisableText = null;
    }
  }

  ngOnDestroy() {
  }

  refresh(): boolean {
    return false;
  }

}
