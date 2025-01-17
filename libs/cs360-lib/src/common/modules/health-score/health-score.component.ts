import {Component, Input, OnInit} from '@angular/core';
import { HealthScoreService } from './health-score.service';
import { NzI18nService } from '@gs/ng-horizon/i18n';
@Component({
  selector: 'gs-cs360-health-score',
  templateUrl: './health-score.component.html',
  styleUrls: ['./health-score.component.scss']
})
export class HealthScoreComponent implements OnInit {

  @Input() data: any;
  public properties = {
      size:"sm",
      isEditable:false,
      fact: {},
      measureData:{}
  } as any;
  public params: any;
  public trend_css: string;
  public render: boolean = false;
  public tooltipVisableText: string;
  constructor(private healthScoreService: HealthScoreService, private i18nservice : NzI18nService ) { }


  ngOnInit(): void {
  //{360.admin.health_score.label}=Label:
  this.params = this.data.value && this.data.value.properties ? this.data.value.properties: {};
  if (this.params.label) {
    this.tooltipVisableText = this.i18nservice.translate('360.admin.health_score.label')  + `${this.params.label}`;
  }
  else {
    this.tooltipVisableText = null;
  }
  this.healthScoreService.getScorecardSchemeListInfo().subscribe(schemeListInfo => {
      const selectedScheme = schemeListInfo.find(sch => sch.type === (this.params.schemeType || "NUMERIC"));
      this.data = {...this.properties,
                    fact : {
                      curScore: this.params.score,
                      curScoreColor: this.params.color,
                      curScoreLabel: this.params.label,
                      trend: this.params.trend,
                      label: this.params.label
                    },
                    selectedScheme
                  };
                  this.render = true;
    });
  }

  

  // ngOnInit() {
  //   this.params = this.data.value && this.data.value.properties ? this.data.value.properties: null;
  //   if(this.params) {
  //     this.trend_css = this.addTrendIcon();
  //   }
  // }

  // addTrendIcon(): string {
  //   let cls: string = "";
  //   const { trend } = this.params;
  //   if(trend === "" || trend === undefined){
  //     cls = "";
  //   }else if(trend == 0){
  //     cls += 'trend-flat';
  //   }else if(trend > 0){
  //     cls += 'trend-up';
  //   }else if(trend < 0){
  //     cls += 'trend-down';
  //   }
  //   return cls;
  // }

  // ngOnDestroy() {
  // }

}
