import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { COLUMN_VIEW } from "@gs/gdk/grid";
import { SubSink } from 'subsink';

@Component({
  selector: 'gs-grid-column-chooser',
  templateUrl: './grid-column-chooser.component.html',
  styleUrls: ['./grid-column-chooser.component.scss']
})
export class GridColumnChooserComponent implements OnInit, OnChanges, OnDestroy {

  @Input() columns: any;

  @Output() columnsUpdated = new EventEmitter<any[]>();

  allChecked = false;
  indeterminate = true;
  searchInput = new FormControl();
  searchTerm: string;
  columnChooserVisible: boolean;
  checkBoxColumns: any[] = [];

  private subs = new SubSink();

  constructor() { }

  ngOnInit() {
    this.subscribeForSearchInput();
  }

  subscribeForSearchInput() {
    this.subs.add(this.searchInput.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((text: any) => {
      this.searchTerm = text;
      const filteredColumns = this.searchTerm ? 
                                this.checkBoxColumns.filter(x => x.headerName.toLowerCase().includes(this.searchTerm.toLowerCase())) :
                                this.checkBoxColumns;
      this.updateSingleChecked(filteredColumns);
    }));
  }
  
  ngOnChanges() {
    if(this.columns && !this.checkBoxColumns.length) {
      this.setColumns();
    }
  }

  setColumns(columns?: any) {
    if(columns) {
      this.columns = columns;
      this.checkBoxColumns = [];
    }
    this.columns.forEach(col => {
      if(col.field !== COLUMN_VIEW.GRID_ACTION_COLUMN && col.field !== COLUMN_VIEW.PREVIEW_ACTION_COLUMN) {
        this.checkBoxColumns.push({...col, show: !col.hide && !col.hidden});
      }
    });
  }

  updateAllChecked(): void {
    this.indeterminate = false;
    let filteredColumns = this.checkBoxColumns;
    if(this.searchTerm) {
      filteredColumns = this.checkBoxColumns.filter(x => x.headerName.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }
    filteredColumns.forEach(c => c.show = c.disabled ? c.show : this.allChecked);
    this.updateSingleChecked(filteredColumns);
  }

  updateSingleChecked(columns?: any[]): void {
    const columnsToCheck = columns ? columns : this.checkBoxColumns;
    if (columnsToCheck.every(item => !item.show)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (columnsToCheck.every(item => item.show)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }

  onVisibleChange() {
    this.searchTerm = "";
    this.searchInput.reset();
    this.setColumns(this.columns);
    this.updateSingleChecked();
  }

  onClose() {
    this.columnChooserVisible = false;
    this.searchTerm = "";
    this.searchInput.reset();
    this.setColumns(this.columns);
    this.updateSingleChecked();
  }
  
  onSave() {
    const updatedColumns = this.columns.map(col => {
      const updatedCol = this.checkBoxColumns.find(c => c.colId === col.colId);
      col.hide = updatedCol && !updatedCol.show;
      return col;
    });
    this.columnsUpdated.emit(updatedColumns);
    this.onClose();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
