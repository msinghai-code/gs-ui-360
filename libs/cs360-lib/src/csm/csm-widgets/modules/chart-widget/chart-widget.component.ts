import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { CsmSummaryService, ChartWidgetDataFormat } from '../../../csm-sections/modules/csm-summary/csm-summary.service';
import { CsmWidgetBaseComponent } from '../csm-widget-base/csm-widget-base.component';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'gs-chart-widget',
  templateUrl: './chart-widget.component.html',
  styleUrls: ['./chart-widget.component.scss']
})
export class ChartWidgetComponent extends CsmWidgetBaseComponent implements OnInit, OnDestroy {

  chartConfig: Highcharts.Options;
  seriesDataCache = {};
  data: ChartWidgetDataFormat;
  chartConfigLoaded = false;
  width = 0;
  isGrouped = false;

  constructor(public csmSummaryService: CsmSummaryService, @Inject(CONTEXT_INFO) public ctx) {
    super(csmSummaryService, ctx);
  }

  dataLoaded() {
    // Need chart's parent container to be rendered before rendering the chart - to make the chart adapt parent's height and width (cdr.detectChanges() didn't worked -_-)
    this.chartConfigLoaded = false;
    if(this.data) {
      this.width = this.data.chartConfig.series[0]['data'].length * 39;
      if(this.data.chartConfig.series.length > 2) {
        this.isGrouped = true;
      }
    }
    setTimeout(this.setChartConfig.bind(this), 0);
  }
  
  private setChartConfig() {
    this.chartConfig = {
      ...cloneDeep(chartConfig),
      tooltip: {
        ...chartConfig.tooltip,
        headerFormat: this.isGrouped ? '<span style="font-size: 12px; font-weight: bold;">{point.point.name}</span><br/>' : '',
        pointFormat: this.isGrouped ? `<span style="color: #c7c7c7">{series.name}: {point.y}</span><br/>` : `{point.name}: {point.y}`,
      },
      ...(this.data && this.data.chartConfig)
    }

    if(this.isGrouped) {
      this.chartConfig.plotOptions.column.pointWidth = 8;
      this.chartConfig.plotOptions.column.groupPadding = 0.8;
    }
    this.chartConfigLoaded = true;
  }

  ngOnDestroy() {
    this.seriesDataCache = {};
  }
}

const chartConfig: Highcharts.Options = {
  chart: { type: 'column' },
  credits: { text: '' },
  title: { text: null },
  legend: {
    enabled: true,
    verticalAlign: 'top',
    align: 'left',
    itemStyle: {
      fontSize: '11px',
      fontWeight: '100'
    },
    layout: 'horizontal'
  },
  tooltip: {
    shared: true,
    style: {
      color: '#fff',
    },
    backgroundColor: '#1f364d',
    borderRadius: 8,
    borderColor: 'transparent',
    shadow: {
      color: 'transparent'
    }
  },
  xAxis: {
    type: 'category',
    labels: {
      rotation: -45
    },
    lineColor: 'transparent'
  },
  yAxis: [{
    title: {
      text: ''
    },
    showFirstLabel: false,
    gridLineWidth: 0,
    maxPadding: 0,
    labels: {
      enabled: false
    }
  }],
  plotOptions: {
    column: {
      stacking: 'normal',
      shadow: false,
      borderWidth: 0,
      borderRadius: 2,
      pointWidth: 14,
      // groupPadding: 0.3,
      states: {
        inactive: {
          opacity: 1
        },
      }
    },
  },
}