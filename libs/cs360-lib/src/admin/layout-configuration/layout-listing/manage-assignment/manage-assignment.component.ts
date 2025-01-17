import { AfterViewInit, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { GridApi } from '@ag-grid-community/core';
import {  LOADER_TYPE} from "@gs/gdk/spinner";
import {
  formatColumnDefinitionsForGrid,
  AGGridEditMode
} from "@gs/gdk/grid";
import { DEFAULT_LOOKUP_SELECT_FIELDS } from "@gs/gdk/core";
import { FilterQueryService, getLookupOnFieldForAutoSuggest, getResolvedFilterValues} from "@gs/gdk/filter/builder";
import { formLookupSearchPayload } from "@gs/cs360-lib/src/core-references";
import { SubSink} from 'subsink';
import { FormGroup, FormBuilder } from '@angular/forms';
import { isEmpty, includes, cloneDeep, forEach, orderBy, filter, size} from 'lodash';
import { AssignmentCondition, ManageAssignmentService } from "./manage-assignment.service";
import { Observable, of, Subject, forkJoin } from "rxjs";
import { map } from 'rxjs/operators';
import { AssignmentConditionsComponent } from './assignment-conditions/assignment-conditions.component';
import { CS360Service, DataTypes } from '@gs/cs360-lib/src/common';
import { ADMIN_CONTEXT_INFO, IADMIN_CONTEXT_INFO } from '@gs/cs360-lib/src/common';
import { Cs360ContextUtils } from '@gs/cs360-lib/src/common';
import { APPLICATION_ROUTES, ObjectNames, PageContext } from '@gs/cs360-lib/src/common';
// import { LayoutSharingType } from '../../../layout-configuration/layout-upsert/layout-upsert.constants';
import { Router } from '@angular/router';
import { NzI18nService } from '@gs/ng-horizon/i18n';
import { EnvironmentService, UserService } from '@gs/gdk/services/environment';
import { getFieldMeta } from '@gs/cs360-lib/src/portfolio-copy';

@Component({
  selector: 'gs-layout-listing-manage-assignment',
  templateUrl: './manage-assignment.component.html',
  styleUrls: ['./manage-assignment.component.scss']
})
export class ManageAssignmentComponent implements OnInit, AfterViewInit {

  @Input() describeData: any;
  @Input() managerelation: any ;
  @Output() titleChanged = new EventEmitter<any>();
  @Output() change = new EventEmitter<any>();

  public config: any;
  public showFindLayout = false;
  public data: any[];
  public filteredData: any[];
  private gridApi: GridApi;

  icons = {
    rowDrag: `<i nz-icon class="gs-icons gs-icons-draggable-indicator" nzType="drag" nzTheme="general" nzSize="24"></i>`
  }
  objectName: string;
  objectNameForText: string;
  isPartner: boolean = false;
  //{360.admin.manage_assignment.rank}=Rank
  //{360.admin.manage_assignment.layout_name}=Layout Name
  //{360.admin.manage_assignment.assignment}=Assignment
  public MANAGE_ASSIGNMENT_GRID_COLUMN_DEF = [
    {
      rowDrag: params => !params.node.data.default,
      field: '',
      headerName: '',
      maxWidth: 40
    },
    {
      field: 'displayOrder',
      headerName: this.i18nService.translate('360.admin.manage_assignment.rank'),
      maxWidth: 100,
      dataType: 'number',
      colId: "displayOrder",
      cellRenderer: (params) => (params.data.displayOrder + 1),
      cellClass: 'rank-cell'
    },
    {
      field: 'layoutName',
      headerName: this.i18nService.translate('360.admin.manage_assignment.layout_name'),
      maxWidth: 200,
      dataType: 'string'
    },
    {
      field: 'filter',
      headerName: this.i18nService.translate('360.admin.manage_assignment.assignment'),
      dataType: 'string',
      minWidth: 450,
      autoHeight: true,
      cellRendererFramework: AssignmentConditionsComponent,
    }
  ];
  detailsForm: FormGroup;
  searchInputSubject = new Subject<any>();
  searching = <any>{};
  resultedItems: {
    [key: string]: any[];
    gsuser: any[]
  } = <any>{};
  relationshipTypes: any[] = [];
  selectedRelationshipType;
  layout: {name: string, id: string};

  private subs = new SubSink();

  public loader: boolean = false;
  loaderOptions = {
    loaderType: LOADER_TYPE.SVG,
    loaderParams: {
      svg_url_class: 'gs-loader-vertical-bar-skeleton',
      svg_wrapper_class: 'gs-loader-vertical-bar-skeleton-wrapper-opacity'
    }
  }
  currentOrderPayload: any;

  constructor(private manageAssignmentService: ManageAssignmentService,
    private fqs: FilterQueryService,
    private c360Service: CS360Service,
    @Inject("envService") protected env: EnvironmentService,
    private fb: FormBuilder,
    @Inject(ADMIN_CONTEXT_INFO) protected ctx: IADMIN_CONTEXT_INFO,
    private router: Router,
    private i18nService: NzI18nService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.isPartner = this.router.url.includes('partner') ? true : false;
    this.loader = true;
    this.change.emit(false);
    this.objectName = this.ctx.baseObject;
    // this.relationshipTypes = this.env.moduleConfig.relationshipTypes || [];
    this.relationshipTypes = this.env.moduleConfig.ctxEntityTypes || [];
    this.objectNameForText = this.ctx.translatedBaseObjectLabel;
    const preselectedType = this.relationshipTypes.find(type => type.Gsid === this.managerelation.Gsid);
    this.selectedRelationshipType = preselectedType || this.relationshipTypes[0];
    this.onRelationshipTypeChange(true);
    this.config = this.createConfig();
    this.fetchAssignments();
    this.detailsForm = this.fb.group({
      [this.objectName]: [null],
      gsuser: [null]
    });
    this.detailsForm.valueChanges.subscribe(change => {
      if(change.gsuser && change[this.objectName]) {
        this.layout = <any>{};
        this.subs.add(this.manageAssignmentService.getLayout(change[this.objectName], change.gsuser, this.ctx.baseObject, this.isPartner).subscribe(layout => {
          this.layout = layout;
        }))
      }
    })
  }

  ngAfterViewInit() {
    this.setUpAutoSuggest();
    // Load some records by default
    this.loadRecordsByDefault();
  }

  setUpAutoSuggest(){
    this.searchInputSubject.subscribe(info => {
      if(this.isPartner) {
        if(info.objectName === ObjectNames.RELATIONSHIP) {
          this.relationshipSearchLookupField(info);
        } else {
          this.resultedItems[info.objectName] = [];
          if(info.searchTerm.length >= 1) {
            this.searching = {[info.objectName]: true};
            this.searchLookupFieldForPartner(info);
          } else {
            this.loadRecordsByDefault();
          }
        }
      } else if(info.objectName === ObjectNames.RELATIONSHIP){
        this.doAdvanceLookupsearch(info.searchTerm);
      }else{
        this.resultedItems[info.objectName] = [];
        if(info.searchTerm.length >= 1) {
          this.searching = {[info.objectName]: true};
          this.searchLookupField(info);
        } else {
          this.loadRecordsByDefault();
        }
      }
    });
  }

  relationshipSearchLookupField(searchInfo: any) {
    const searchTerm = (searchInfo.searchTerm || '').trim();
    const objectName = searchInfo.objectName;
    const payload = {
      limit: 10,
      objectName: objectName,
      offset: 0,
      select: ["name", "gsid"],
      where: {
        expression: "A AND B",
        conditions: [
          {
            alias: "A",
            name: "name",
            operator: "CONTAINS",
            value: [searchTerm]
          },
          {
            alias: "B",
            name: "managedBy.managedAs",
            operator: "EQ",
            value: ['PARTNER']
          }
        ]
      }
    }
    this.c360Service.queries(objectName, payload).subscribe(response => this.onSearchResponse(response.data.records, objectName));
  }

  doAdvanceLookupsearch(searchTerm){
    this.manageAssignmentService.fetchRelationShipAdvanceLookup({
      TypeId : this.selectedRelationshipType.Gsid,
      Name : searchTerm
    }).subscribe(response => {
      if(response && response.success) {
        this.onSearchResponse(response.data , ObjectNames.RELATIONSHIP);
      }
    })
  }

  loadRecordsByDefault(){
    // if(this.objectName === ObjectNames.COMPANY) {
    //   this.searchLookupField({searchTerm: '', objectName: this.objectName, forceSearch: true });
    // }
    // this.searchLookupField({searchTerm: '', objectName: ObjectNames.USER, forceSearch: true });
    this.ctx.manageAssignmentConfig.lookupFields.map(field => this.searchLookupField(field));
  }

  toggleView() {
    this.layout = null;
    this.detailsForm.reset();
    this.showFindLayout = !this.showFindLayout;
  }

  onRelationshipTypeChange(filterRelationships?: boolean) {
    if(this.objectName !== ObjectNames.RELATIONSHIP) {
      return;
    }
    if(filterRelationships) {
      if(this.detailsForm && this.detailsForm.get(this.objectName).value) {
        this.detailsForm.get(this.objectName).reset();
      }
      this.searchLookupField({searchTerm: this.selectedRelationshipType.Gsid, objectName: this.objectName, searchFields: ["TypeId"], forceSearch: true });
      this.searchLookupField({searchTerm: '', objectName: ObjectNames.USER, forceSearch: true });
    }
    if(this.data) {
      this.filteredData = orderBy(this.data.filter(ass => ass.relationshipTypeId === this.selectedRelationshipType.Gsid), ['displayOrder'], ['asc']);
    }
  }

  private createConfig(): any {
    return {
      options: {
        columnDefs: formatColumnDefinitionsForGrid({
          columns: this.MANAGE_ASSIGNMENT_GRID_COLUMN_DEF,
          additionalProps: {
            enableTooltip: false
          },
          callbacks: {colClass: (field) => ["displayOrder", 'layoutName'].includes(field && field.colId) ? 'layout-name' : '' }
        }),
        defaultColDef: {
          sortable: false,
          filter: false
        },
        onGridReady: (params) => {
          this.gridApi = params.api;
          this.gridApi.sizeColumnsToFit();
        },
        sortable: false,
        rowDragManaged: true,
        animateRows: true,
        onRowDragEnd: this.onRowDragEnd.bind(this),
        onRowDragLeave: this.onRowDragLeave.bind(this),
        noRowsOverlayComponentParams: {
          title: 'No Layouts found',
          message: ''
        },
        getRowNodeId: (data): string => data.layoutId,
        autoResizeColumnsToFit: false
      },
      mode: AGGridEditMode.NONE,
      additionalOptions: {}
    }
  }

  private prepareAutoSuggestrequestPayload(filterRecord, filterValue){
    if(
      filterValue.userLiteral !== "ALL_USERS"
      && filterValue.userLiteral !== "CURRENT_USER"
    ){
      const {data}= filterRecord.selectedField as any;
      const val = filterValue.value || [];
      const selectFields = cloneDeep(DEFAULT_LOOKUP_SELECT_FIELDS);
      const lookupOnWhichField = data.meta.lookupDetail ? data.meta.lookupDetail.fieldName: getLookupOnFieldForAutoSuggest(filterRecord.selectedField);
      if(!!lookupOnWhichField && selectFields.indexOf(lookupOnWhichField) === -1) {
        selectFields.push(lookupOnWhichField);
      }
      return formLookupSearchPayload({
        field: filterRecord.selectedField,
        selectFields,
        searchFields: !!lookupOnWhichField ? [lookupOnWhichField]: ['Gsid'],
        value: val,
        operator: 'IN'
      });
    }
  }

  private getAutoSuggestResults(filterRecord , filterValue) : Observable<any>{
    if(!!filterValue && (!filterValue.value || filterValue.value.length === 0)) {
      return of([]);
    }
    const autoSuggestRequestPayload = this.prepareAutoSuggestrequestPayload(filterRecord , filterValue);
    if(autoSuggestRequestPayload){
      return this.fqs.search([autoSuggestRequestPayload]).pipe(map((v: any[])  => {
        let resolvedIds = {};
        if(!isEmpty(v) && v.length){
          const key = autoSuggestRequestPayload.searchFields[0].toLowerCase();
          resolvedIds = v.reduce((acc, curr) => {
            const resolvedKey = !!curr[key] ? curr[key].replace(/ /ig, "_").toLowerCase(): null;
            if(!!resolvedKey && !acc[resolvedKey]) {
              acc[resolvedKey] = curr;
            }
            return acc;
          }, resolvedIds);
        }
        return [resolvedIds];
      }))
    }else{
      return of({})
    }
  }

  private fetchAssignments() {
    this.subs.add(
      this.manageAssignmentService.fetchAssignments({
        sharingType: this.ctx.sharingType,
        entityType: this.ctx.baseObject,
        isPartner: this.isPartner
      }).subscribe((assignments) => {
        assignments.forEach(assignment  => {
          delete assignment.showAllConditions;
        });
        this.modifyAssignmentsWithLookups(assignments);
        this.loader = false;
      })
    );
  }

  modifyAssignmentsWithLookups(assignments: any[]) {
    let observables: Observable<any>[] = [];
    const modifiedAssignments = [];
    assignments.forEach(data => {
      if(isEmpty(data.filter) || isEmpty(data.filter.conditions)) {
        modifiedAssignments.push(data);
        return;
      }
      const conditionObservables = [];
      data.filter.conditions.map((condition: AssignmentCondition) => {
          if(condition.filterValue && condition.filterValue.value){
              if(condition.filterValue.value[0] === true) {
                  condition.filterValue.value[0] = this.i18nService.translate('360.admin.boolean_options.true')
              } else if(condition.filterValue.value[0] === false){
                  condition.filterValue.value[0] = this.i18nService.translate('360.admin.boolean_options.false')
              }
          }
        if(!includes([DataTypes.MULTISELECTDROPDOWNLIST, DataTypes.LOOKUP, DataTypes.PICKLIST], condition.leftOperand.dataType)) {
          return;
        }
        try {
          let baseObject;
          const fieldInfo = condition.leftOperand
          if(fieldInfo.fieldPath) {
            baseObject = fieldInfo.fieldPath.right && fieldInfo.fieldPath.right.objectName;
          } else {
            baseObject = fieldInfo.objectName;
          }
          this.describeData[baseObject].fields = this.describeData[baseObject].obj.fields;
          const fieldMeta = getFieldMeta(fieldInfo, this.describeData[baseObject], baseObject);
          condition.describeField = fieldMeta;
          if(fieldMeta.dataType === DataTypes.LOOKUP && condition.filterValue && size(condition.filterValue.value)) {
            const filterRecord = {...condition, selectedField: {data: fieldMeta}};
            const subType = condition.filterValue.dateLiteral || condition.filterValue.userLiteral || (condition.filterValue.currencyCode);// || this.globalFilterConfig.filter.leftOperand.currencyCode
            conditionObservables.push(new Observable(obs => {
              this.getAutoSuggestResults(filterRecord, condition.filterValue).subscribe(resp => {
                condition.value = this.getInitialValue(subType, resp[0], condition.filterValue);
                obs.next(condition);
                obs.complete();
              })
            }));
          }
        }
        catch {}
      });
      if(conditionObservables.length) {
        // forkJoin(conditionObservables).subscribe(resp => modifiedAssignments.push(data));
        observables = observables.concat(cloneDeep(conditionObservables));
        modifiedAssignments.push(data);
      } else {
        modifiedAssignments.push(data);
      }
    });
    setTimeout(() => {
      forkJoin(observables.length ? observables : of([])).subscribe(resp => {
        this.populateObjectDetails(modifiedAssignments)
        this.data = cloneDeep(modifiedAssignments);
        if(this.selectedRelationshipType) {
          this.filteredData = orderBy(modifiedAssignments.filter(ass => ass.relationshipTypeId === this.selectedRelationshipType.Gsid), ['displayOrder'], ['asc']);
        } else {
          this.filteredData = cloneDeep(orderBy(modifiedAssignments, ['displayOrder'], ['asc']));
        }
      })
    })
  }

  private populateObjectDetails(assignments) {
    // Populating objectLabel 
    assignments.forEach(assignment => {
      if(!assignment || !assignment.filter || !assignment.filter.conditions) {
        return;
      }
      assignment.filter.conditions.forEach(condition => {
        let baseObject;
        const fieldInfo = condition.leftOperand
        baseObject = fieldInfo.fieldPath ? fieldInfo.fieldPath.right && fieldInfo.fieldPath.right.objectName : fieldInfo.objectName;

        if(this.describeData[baseObject] && this.describeData[baseObject].obj) {
          condition.leftOperand.objectLabel = this.describeData[baseObject].obj.label;
        }
      });
    });
  }

  private getUserConfigByHostType(): any {
    return !isEmpty(this.userService.gsUser) ? this.userService.gsUser: this.env.user;
  }

  private getInitialValue(subType, resolvedIds, filterValue){
    console.log('filterValue',filterValue)
    let value;
    if (filterValue.userLiteral) {
      if (filterValue.userLiteral === "CURRENT_USER") {
        value = [this.getUserConfigByHostType()];
      } else if (subType === "ALL_USERS") {
        value = [{ name: "All Users" }];
      } else {
        if (filterValue.value && filterValue.value.length > 0) {
          const f = getResolvedFilterValues;
          value = f({filterValue : filterValue}, resolvedIds);
        }
      }
    } else {
      if (filterValue.value && filterValue.value.length > 0) {
        value = getResolvedFilterValues({filterValue: filterValue}, resolvedIds);
      }
    }
    return value;
  }

  private getSearchableFields(objectName: string, select?: boolean) {
    let fields =["Name"];
    switch(objectName) {
      //TODO: Need to get rid fo this swtch case if fields changes only for USER objectName. Can change to if else.
      // case ObjectNames.COMPANY: fields = ["Name"]; break;
      // case ObjectNames.RELATIONSHIP: fields = ["Name"]; break;
      case ObjectNames.USER: fields = ["Name", "Email"];break;
    }
    if(select) {
      fields.push("Gsid");
    }
    return fields;
  }

  private onSearchResponse(results: any[], objectName: string) {
    forEach(results, result => {
      result.displayLabel = result.name || result.email;
      result.value = result.gsid;
    });
    this.resultedItems[objectName] = results;
    this.searching = {};
  }

  searchLookupFieldForPartner(searchInfo: any) {
    const term = (searchInfo.searchTerm || '').trim();
    const objectName = searchInfo.objectName;
    if (term.length >= 1 || searchInfo.forceSearch) {
      if (objectName === 'gsuser') {
        let payload = {
          limit: 10,
          objectName: objectName,
          offset: 0,
          select: ["name", "gsid", "email"],
          where: {
            expression: "A AND B",
            conditions: [
              {
                alias: "A",
                name: "name",
                operator: "CONTAINS",
                value: [term]
              },
              {
                alias: "B",
                name: "IsPartner",
                operator: "EQ",
                value: [true]
              }
            ]
          }
        }
        this.c360Service.queries(objectName, payload).subscribe(response => this.onSearchResponse(response.data.records, objectName));
      }
      else {
        let payload = {
          limit: 10,
          objectName: objectName,
          offset: 0,
          select: ["name", "gsid"],
          where: {
            expression: "A AND B",
            conditions: [
              {
                alias: "A",
                name: "name",
                operator: "CONTAINS",
                value: [term]
              },
              {
                alias: "B",
                name: "managedBy",
                operator: "IS_NOT_NULL"
              }
            ]
          }
        }
        this.c360Service.queries(objectName, payload).subscribe(response => this.onSearchResponse(response.data.records, objectName));
      }
    }
  }

  searchLookupField(searchInfo: any) {
    const term = (searchInfo.searchTerm || '').trim();
    const objectName = searchInfo.objectName;
    if (term.length >= 1 || searchInfo.forceSearch) {
      const query = [
        {
          // selectFields: searchInfo.selectFields ? searchInfo.selectFields : this.getSearchableFields(objectName, true),
          // searchFields: searchInfo.searchFields ? searchInfo.searchFields : this.getSearchableFields(objectName),
          selectFields: searchInfo.selectFields ? searchInfo.selectFields : searchInfo.fields ? [...searchInfo.fields, "Gsid"]: this.getSearchableFields(objectName, true),
          searchFields: searchInfo.searchFields ? searchInfo.searchFields : searchInfo.fields ? searchInfo.fields : this.getSearchableFields(objectName),
          value: [term],
          operator: 'CONTAINS',
          useDBName: false,
          object: objectName,
          source: "MDA",
          dataStore: "HAPOSTGRES",
          connectionId: null
        }
      ];
      if (objectName === 'gsuser') {
        try {
          query[0].selectFields.push('IsActiveUser');
          return this.fqs.search(query).pipe(map(v => {
            if (v && v.length) {
              v = v.filter(x => x.isactiveuser);
            }
            return v;
          })).subscribe(response => this.onSearchResponse(response, objectName));
        } catch (e) {
          query[0].selectFields = ['Name', 'Gsid'];
          return this.fqs.search(query).subscribe(response => {
            this.onSearchResponse(response, objectName);
          })
        }
      }
      else
        this.fqs.search(query).subscribe(response => this.onSearchResponse(response, objectName));
    }
  }

  onRowDragEnd(evt: any): void {
    this.loader = true;
    let payload: any = {};
    let index: number = 0;
    let defaultIndex;
    evt.api.forEachNode(node => {
      const { data } = node;
      if(data.default) {
        defaultIndex = index;
      }
      index++;
    });
    if(defaultIndex + 1 !== this.filteredData.length) {
      this.loader = false;
      this.filteredData = cloneDeep(orderBy(this.filteredData, ['displayOrder'], ['asc']));
      return;
    }
    index = 0;
    this.change.emit(true);
    evt.api.forEachNode(node => {
      const { data } = node;
      data.displayOrder = index;
      payload[data.layoutId] = index++;
    });
    this.gridApi.refreshCells({columns: ['displayOrder']})
    this.currentOrderPayload = payload;
    this.loader = false;
  }

  onRowDragLeave(event: any) {
    this.loader = true;
    let index: number = 0;
    let payload: any = {};
    let defaultIndex;
    event.api.forEachNode(node => {
      const { data } = node;
      if(data.default) {
        defaultIndex = index;
      }
      index++;
    });
    if(defaultIndex + 1 !== this.filteredData.length) {
      this.loader = false;
      this.filteredData = cloneDeep(orderBy(this.filteredData, ['displayOrder'], ['asc']));
      return;
    }
    index = 0;
    this.change.emit(true);
    event.api.forEachNode(node => {
      const { data } = node;
      data.displayOrder = index;
      payload[data.layoutId] = index++;
    });
    this.gridApi.refreshCells({columns: ['displayOrder']})
    this.currentOrderPayload = payload;
    this.loader = false;
  }

  onFindLayoutClick() {
    this.titleChanged.emit();
  }

  ngOnDestroy(): void {
    this.manageAssignmentService.invalidateCache();
    this.subs.unsubscribe();
  }

  save() {
    return this.manageAssignmentService.reorderLayouts(this.currentOrderPayload);
  }

  navigateToConfigure(layout) {
    let queryParams;
    // if(this.ctx.pageContext === PageContext.R360) {
    if(this.ctx.standardLayoutConfig.groupByType) {
      queryParams = { typeId: this.selectedRelationshipType.Gsid};
    } if(this.router.url.includes('partner')) {
      if(queryParams) {
        queryParams = { ...queryParams, managedAs: 'partner' };
      } else {
        queryParams = { managedAs: 'partner' };
      }
    }
    this.router.navigate([APPLICATION_ROUTES.LAYOUT_CONFIGURE(layout.layoutId)], { queryParams});
  }

}
