import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { ISummaryAttributeData } from "../../ISummaryInterface";
import * as font from '@gs/design-tokens/font';
import * as color from '@gs/design-tokens/colors';
import * as Highcharts from "highcharts";

@Component({
    selector: 'gs-visualization-attribute-view',
    templateUrl: './visualization-view.component.html',
    styleUrls: ['./visualization-view.component.scss']
})
export class VisualizationViewComponent implements OnInit {

    @Input() attributeConfig: ISummaryAttributeData;

    @Output() changes : EventEmitter<any> = new EventEmitter<any>();
    public data:any = {};
    Highcharts: typeof Highcharts = Highcharts;
    isHealthScore:boolean = false;


    ngOnInit() {
      this.isHealthScore = this.attributeConfig.id === "Health_Score" || this.attributeConfig.name === "Distribution by Health" ? true : false;
    }

    ngAfterViewInit(){
    }

    getChartOptions(){
        return this.getPieChartOptions({
            chartType : 'PIE',
            chartHeight:40,
            chartWidth:40,
            chartSize:35,
            seriesData : this.attributeConfig.visualization.values,
            isLegendVisible : false
        })
    }

    getPieChartOptions(chartConfig){
        const seriesValue = [];
        if(chartConfig.seriesData && chartConfig.seriesData.length > 0){
          chartConfig.seriesData.forEach(series => {
            seriesValue.push({
              name: series.value,
              y: series.value,
              color:series.color,
              tooltipVal:series.tooltip,
            });
          });
        
          var updateLegend = function(chart) {
            chart.legend.group.attr({
              translateY: chartConfig.chartHeight/2
            });
          };
        
          let chartOptions = {
            chart : {
              plotBorderWidth: null,
              plotShadow: false,
              height:chartConfig.chartHeight,
              width:chartConfig.chartWidth,
              events: {
                load: function() {
                  updateLegend(this)
                }
              }
            },
            title: chartConfig.chartType === 'SEMI_PIE' ? {
              text: `<span style="line-height: ${font.fontSizeLg};font-size:${font.fontSizeSm};color:${color.richGray60}">${chartConfig.title.label} </label> <br> <span style="line-height: 24px;font-weight: 600;font-size:14px;color:#181F26;font-family: 'Roboto'">${chartConfig.title.value}</span>`,
              align: 'center',
              verticalAlign: 'middle',
              y: 0
            } : {
              text : ''
            },
            credits: {
              enabled: false
            },
            legend: {
              align: 'center',
            },
            tooltip: {
              useHTML: true,
              outside: true,
              backgroundColor: 'black',
              borderWidth: 0,
              style: {
                width: 'auto',
                whiteSpace: 'nowrap',
                color: 'white',
                boxShadow: 'none'
              },
              formatter: function() {
                return this.point.tooltipVal;
              },
            },
            plotOptions : {
              pie: {
                startAngle: -90,
                endAngle: 270,
                dataLabels: {
                  distance: 0,
                  enabled: false
                },
                showInLegend: chartConfig.isLegendVisible,
                states: {
                  hover: {
                    enabled: false,
                  },
                  inactive: {
                    enabled: false,
                  },
                }
              }
            },
            series : [{
              size : chartConfig.chartSize,
              innerSize: "60%",
              type: 'pie',
              data: seriesValue
            }]
          };
          return chartOptions;

        } else {
          return []
        }
      }

}
