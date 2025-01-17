import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {IPaginatorAction} from "../../pojos/paginator.interface";
import {PORTFOLIO_GRID_ACTIONS} from "../../pojos/portfolio.constants";

@Component({
  selector: 'gs-grid-visualizer',
  templateUrl: './grid-visualizer.component.html',
  styleUrls: ['./grid-visualizer.component.scss']
})
export class GridVisualizerComponent implements OnInit, OnChanges {

  @Input() data: Array<any>;

  @Input() gridTheme = 'ag-theme-balham';

  @Input() config: any;

  @Input() gridType = "AG-GRID";

  @Input() bufferMargin: any = { top: 0, bottom: 0 };

  @Output() pagerAction = new EventEmitter<any>();

  @Output() sortAction = new EventEmitter<any>();

  @Output() filterAction = new EventEmitter<any>();

  @Output() columnResizeAction = new EventEmitter<any>();

  @Output() columnMoved = new EventEmitter<any>();

  @Output() gridReady = new EventEmitter<any>();

  get parentElement(): HTMLElement {
    return this.el.nativeElement.parentElement;
  }

  public gridHeight: number;
  public gridWidth: number;

  gridRowHeightConfig = {
    headerHeight: 28,
    rowHeight: 32,
    floatingFiltersHeight: 32
  }

  resizeGridDimensions() {
    const parentDimension = this.getParentDimensions();
    this.gridHeight = parentDimension.height;
    this.gridWidth = parentDimension.width;
  }

  constructor(private el: ElementRef) { }

  ngOnInit() {
    const parentDimension = this.getParentDimensions();
    this.gridHeight = parentDimension.height;
    this.gridWidth = parentDimension.width;
    this.buildColumns();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.gridType === 'AG-GRID' && this.config.additionalOptions) {
      if (this.config.additionalOptions.customPaginator.onDemand) {
      } else {
        this.preparePaginationDescription(this.config.additionalOptions.customPaginator.currentPageNum);
      }
    }
    if (changes.config) {
      const config = changes.config.currentValue || {};
      this.config = {
        ...config,
        additionalOptions: {...config.additionalOptions}
      };
    }
  }

  buildColumns(): void {
    const parentDimension = this.getParentDimensions();
    const gridContainerWidth: number = parentDimension.width;
    const columnCount: number = this.config.options.columnDefs.length;
    let widthPerColumn = 200;
    if (gridContainerWidth >= columnCount * widthPerColumn) {
      widthPerColumn = this.calculateWidthPerColumn(this.config.options.columnDefs, gridContainerWidth, widthPerColumn);
    }
    this.setColumnWidth(this.config.options.columnDefs, widthPerColumn);
  }

  calculateWidthPerColumn(columns: any[], gridContainerWidth: number = 0, widthPerColumn) {
    /**
     * 1. Filter all columns who have column width
     * 2. sCW = Sum all column widths for above
     * 3. rC = Count of remaining columns
     * 4. (gridClientWidth - sCW) / rC = col.width for remaining columns
     * 5. If sCW && rC === 0 && sCW !== gridClientWidth => widthPerColumn = gridClientWidth / rC
     * 6. Enabling autoResize and behaviour of
     */
    let sumOfColumnWidths = 0;
    let countOfCustomColumns = 0;
    columns.forEach((column) => {
      if (column.width) {
        sumOfColumnWidths += column.width;
        countOfCustomColumns++;
      }
    });
    const remainingColumns = columns.length - countOfCustomColumns;
    if (remainingColumns > 0) {
      widthPerColumn = (gridContainerWidth - sumOfColumnWidths) / remainingColumns;
    } else if (remainingColumns === 0 &&
      sumOfColumnWidths !== 0 && sumOfColumnWidths !== gridContainerWidth) {
      widthPerColumn = gridContainerWidth / (columns.length);
    }
    return widthPerColumn;
  }

  setColumnWidth(columns: any[], widthPerColumn: number): void {
    for (const col of columns) {
      if (!col.width) {
        col.width = Math.max(widthPerColumn, col.width || 0);
        if (!!col.children && col.children.length > 0) {
          this.setColumnWidth(col.children, 0);
        }
      }
    }
  }

  getParentDimensions(): any {
    const height = this.parentElement.offsetHeight - this.bufferMargin.top;
    const width = this.parentElement.offsetWidth;
    return { width, height };
  }

  onGridChanges(event) {
    switch (event.type) {
      case PORTFOLIO_GRID_ACTIONS.GRID_READY:
        this.gridReady.emit({
          action: PORTFOLIO_GRID_ACTIONS.GRID_READY,
          payload: {
            api: event.payload.api,
            config: this.config
          }
        });
        break;
      case PORTFOLIO_GRID_ACTIONS.SORT:
        this.sortAction.emit({
          action: PORTFOLIO_GRID_ACTIONS.SORT,
          data: event.payload
        });
        break;
      case PORTFOLIO_GRID_ACTIONS.FILTER:
        this.filterAction.emit({
          action: PORTFOLIO_GRID_ACTIONS.SEARCH,
          data: event.payload
        });
        break;
      case PORTFOLIO_GRID_ACTIONS.COLUMN_MOVED:
        this.columnMoved.emit({
          action: PORTFOLIO_GRID_ACTIONS.COLUMN_MOVED,
          data: {
            colsState: event && event.payload ? event.payload.colsState : null
          }
        });
        break;
      case PORTFOLIO_GRID_ACTIONS.PAGINATION:
        this.onPaginationAction(event.payload);
        break;
    }
  }

  onPaginationAction(event) {
    switch (event.action) {
      case IPaginatorAction.NEXT_PAGE:
        if (this.config.additionalOptions.customPaginator.onDemand) {
          this.pagerAction.emit(event);
        } else {
          this.preparePaginationDescription(event.data);
        }
        break;
      case IPaginatorAction.PAGESIZE_CHANGE:
        if (this.config.additionalOptions.customPaginator.onDemand) {
          this.pagerAction.emit(event);
        } else {
          this.preparePaginationDescription(1);
        }
        break;
      case IPaginatorAction.PAGE_CHANGE:
        this.preparePaginationDescription(event.data);
          if (this.config.additionalOptions.customPaginator.onDemand) {
              this.pagerAction.emit(event);
          } else {
              this.preparePaginationDescription(1);
          }
        break;
      case IPaginatorAction.PREVIOUS_PAGE:
        if (this.config.additionalOptions.customPaginator.onDemand) {
          this.pagerAction.emit(event);
        } else {
          this.preparePaginationDescription(event.data);
        }
        break;
      case IPaginatorAction.FETCH_NEXT_PAGE:
        if (this.config.additionalOptions.customPaginator.nextAvailable) {
          this.pagerAction.emit(event);
        }
        break;
    }
  }

  preparePaginationDescription(currentPageNum: number) {
    const pageSize: number = this.config.additionalOptions.customPaginator.currentPageSize;
    const totalRecords: number = this.config.additionalOptions.customPaginator.totalRecords;
    this.config.additionalOptions.customPaginator = {
      ...this.config.additionalOptions.customPaginator,
      fromRecord: ((currentPageNum - 1) * pageSize) + 1,
      toRecord: (currentPageNum * pageSize) > totalRecords ? totalRecords : (currentPageNum * pageSize)
    };
  }
}
