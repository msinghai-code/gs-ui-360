import { GSField } from "@gs/gdk/core";
import {ValueFormatterParams} from "@ag-grid-community/core";
import {isEmpty, cloneDeep} from 'lodash';
import { APP_VARIANT } from "@gs/gdk/directives";

export function getUniqueId() {
  const uniqueId =  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return uniqueId;
}


export function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function formatUrlToLink(comments) {
  let data = comments;
  
  // Updated regex to handle both 'http/https' and 'www' patterns
  const urlCheck = /((https?:\/\/|www\.)[^\s"<]+)(?![^<>]*>|[^"]*?<\/a)/igm;
  
  data = data.replace(
    urlCheck,
    (match) => {
      // Add 'http://' to URLs that start with 'www.'
      const url = match.startsWith('www.') ? 'http://' + match : match;
      return '<a href="' + url + '" target="_blank">' + match + '</a>';
    }
  );
  
  return data;
}


export function resolveSFWidgetProperties() {
  const isNativeWidget = getParameterByName('isNativeWidget');
  const height = getParameterByName('height');
  const sectionName = getParameterByName('sectionName');
  const sectionLabel = getParameterByName('sectionLabel');
  const sectionConfig = getParameterByName('sectionConfig');
  const showTimeline = getParameterByName('showTimeline') === "true";
  return { isNativeWidget, height, sectionType: sectionName, sectionLabel, sectionConfig, showTimeline};
}

export const MDA_HOST = { id: 'MDA', name: 'MDA', type: 'MDA' };

export function getFieldWithMapping(field: GSField, mappingKey: string): boolean {
  return field
      && field.meta
      && field.meta.mappings
      && field.meta.mappings.GAINSIGHT
      && field.meta.mappings.GAINSIGHT.key.toUpperCase() === mappingKey;
}

export function getFieldPath(field, path? : string){
  if(field.fieldPath) {
    const fieldLabel = field.fieldPath.right.fieldLabel || field.fieldPath.right.label;
    let pathLabel = path ? path + ' ➝ ' + fieldLabel : fieldLabel;
    return getFieldPath(field.fieldPath, pathLabel);
  } else {
    return path || "";
  }
}

export function generateKey(field, path? : string){
  if(field.fieldPath) {
    const fieldLabel = field.fieldPath.right.fieldName;
    let pathLabel = path ? path + '_' + fieldLabel : fieldLabel;
    return generateKey(field.fieldPath, pathLabel) + "_" + field.fieldName;
  } else {
    return path ? path : field.fieldName;
  }
}

export function hasNullAsValue(params: ValueFormatterParams | any) {
    return !isEmpty(params) && !!params.value && !params.value.hasOwnProperty('v') && params.valueFormatted === 'NULL';
}

export function isMini360(ctx){
  return ctx && ctx.appVariant === APP_VARIANT.MINI_360;
}

export function miniEmptyScreenSections(sections, isMini360) {
    if (isMini360) {
        const notAvailableSections = sections.filter(section => section['displayOrder'] < 0);
        const availableSections = sections.filter(section => section['displayOrder'] >= 0);

        return availableSections.length === 0 && notAvailableSections.length > 0
            ? notAvailableSections
            : [];
    }
    return [];
}

/* calculates the number of rows needed by summary section Attribute widget gridster-item based on height of the inner rendered content.*/
export function getRowsForAttributeWidget(height?) {

  let totalHeightNeeded;
  if (height) {
    totalHeightNeeded = height + 56; // 56px is the height of each row in the inner content. adding 1 row for buffer
  } else {
    /*
    * Attribute widget is supposed to show 3 rows initially.
    * This is just for initial calculation when innerSection hasn't rendered.
    * This is recalculated based on height of inner section once it is rendered as handled in `if` above.
    * */
    totalHeightNeeded = 56 * 3;// 56px is the height of each row in the inner content
  }
  return Math.ceil(totalHeightNeeded / 40); // 24 + 16px is the height of each row in the outer grid along with margin; 1 for accommodating header and misc
}

/*
* function for any additional handling for mini 360 sections, single source of truth to avoid too many if conditions in app code
* handles summary section widgets for now.
* */
export function formMiniSectionsConfig(sections) {
  sections.forEach(s => {
    if (s.sectionType === "SUMMARY") {
      if (s.config && s.config.widgets) {
        s.config.widgets
            .forEach((widget) => {
              /*
              * overriding dimensionDetails,that comes after admin config, with mini360Dimensions since mini360 has fixed size.
              * overriding dimensionDetails here to avoid making multiple changes in all components working with dimensionDetails.
              * */
              widget.dimensionDetails = widget.mini360Dimensions;
              formMiniWidgetConfig(widget);
            });
      }
    }
    /* remove comment if need to handle attributes widgets using gridster, for now using flex*/
    /*if (s.sectionType === "ATTRIBUTE") {
      if (s.config && s.config.groups && s.config.groups.length > 1) {
        s.config.groups.forEach(g => {
          formMiniWidgetConfig(g);
        })
      }
    }*/
  })
  return sections;
}
/* function to do any customisation for widgets added in admin.
* eg., overriding x,y and axisDetails for summary widgets so that maximum space utilisation can be done by gridster.
* Without x and y, gridster self adjusts widgets based on available space. */
function formMiniWidgetConfig(widget) {
  if (widget.subType === "ATTRIBUTE" && !widget.mini360Dimensions) {
    let rows = getRowsForAttributeWidget();
    widget.dimensionDetails = {
      ...widget.dimensionDetails,
      rows,
      minItemRows: rows
    }
  }
  /*overriding x,y and axisDetails for summary widgets so that maximum space utilisation can be done by gridster.
  * Without x and y, gridster self adjusts widgets based on available space.
  * This is needed for:
  * 1. Auto-adjusting on widgets in summary since it does not honor admin settings
  * 2. Same as 1 after widget customisation */
  widget.x = widget.y = null;
  widget.axisDetails = {
    x: null,
    y: null
  }
/*-----------------------commenting this for now since attributes in mini are handled using flex and not gridster */
  /*let attributes = widget.config || widget.columns;
  /!* attributes is an array for attribute widget, but not for other widgets, so considering the other widget as it is *!/
  const newAttributes = (Array.isArray(attributes) ? attributes : [widget]).map(field => {
    /!* mini360Dimensions not present for attribute widget fields hence assigning dimensionDetails here which is otherwise equal to mini360Dimensions. Check above*!/
    if(!field.mini360Dimensions) {
      const isRTE = field.dataType === "RICHTEXTAREA";
      field.dimensionDetails = {
        rows: isRTE ? 2 : 1,
        cols: isRTE ? 24 : 12
      }
    }
    field.x = field.y = null;
    field.axisDetails = {
      x: null,
      y: null
    }
    return field;
  })

    if (widget.config) {
      if(Array.isArray(attributes)) {
        widget.config = newAttributes;
      } else {
        widget = newAttributes[0];
      }
    } else if (widget.columns) {
      widget.columns = newAttributes;
    }*/
}
/* this determines the initial number of attributes to show and the number of columns needed based on RTE fields
* RTE field takes entire row, so 2 columns are needed for it.
* We only need 3 rows in the beginning so loop breaks when initialColumnsNeeded is 6, i.e., considering each row is 2 columns */
/* this helps in determining
1.if View All/View Less has to be shown. Cannot depend on number of fields because of rte, hence the calculation.
2. How many fields to show initially in mini360 from fields array.
*/
export function calculateAttrsNCellsToShow(attributes) {

  let initialAttrsToShow = 0;
  let initialColumnsNeeded = 0;
  let totalColumnsNeeded = 0;
  let initialColumnsAllowed = 6;
  for (let i = 0; i < attributes.length; i++) {
    /* identifying how many attributes to show initially for 3 rows to be shown in mini*/
    if (initialColumnsNeeded < initialColumnsAllowed && i < initialColumnsAllowed) {
      initialAttrsToShow++;
    }
    if (attributes[i].dataType === 'RICHTEXTAREA') {
      /* adding 2 columns for rte, since it will take 1 whole row */
      totalColumnsNeeded += 2;
      /* incrementing initial columns by 2 accordingly based on rte */
      if (initialColumnsNeeded < initialColumnsAllowed && i < initialColumnsAllowed) {
        initialColumnsNeeded += 2;
      }
    } else {
      /* for non rte, doing single increment for both total and initial columns needed*/
      totalColumnsNeeded++;
      if (initialColumnsNeeded < initialColumnsAllowed && i < initialColumnsAllowed) {
        initialColumnsNeeded++;
      }
    }
  }
  return {initialAttrsToShow, initialColumnsNeeded, totalColumnsNeeded};
}

// used in CH and relationship section
export function gridColumnResized(event, columns, prop) {
    const updatedColumnState = event.payload.colsState;
    // if column is resized, update the width in columns by checking colId in columns and updatedColumnState
    columns.forEach(col => {
        const updatedCol = updatedColumnState.find(col2 => col2.colId === col.itemId || col2.colId === col[prop] || col2.colId === col.fieldName);
        if (updatedCol) {
            col.properties = col.properties || {};
            col.properties.width = updatedCol.width || updatedCol.actualWidth || col.width;
            col.width = updatedCol.width || updatedCol.actualWidth || col.width;
        }
    });
    return columns;
}

export function gridColumnMoved(event, columns,label, fromCH, columnAPi?) {
    const state = ( event.payload && event.payload.colsState? event.payload.colsState: event.payload) || [];
    const columnTobesaved = state && state.filter((col) => col.colId != "column_chooser" && !col.hide)
    let increment = columnTobesaved.length;
    let prop;
    let columnProp;
    if(fromCH)
    {
        prop  = 'label';
        columnProp = 'fieldName'
        columnAPi && columnAPi.applyColumnState({state: columnTobesaved,
            applyOrder: true});
    } else {
        prop = 'label';
        columnProp = 'field';
    }
    columns.forEach(col => {
        const index = columnTobesaved.findIndex(col2 => {
            return col2.colId === col[columnProp];
        })
        if(col[prop] === label){
            col.displayOrder = 0;
        } else {
            if(index> -1 ){
                col.displayOrder = index;
            } else {
                col.displayOrder = increment++;
            }
        }

    })

    return columns;
}

export function isCompanyNameField(field){
    return field.fieldName === "Name" && field.objectName === "company";
}

export function attrConfigSort(groupConfig) {

    const config = cloneDeep(groupConfig);

    if (!config) {
        return null; // return null since config is not present
    }

    config.sort((a, b) => {
        if (a.axisDetails && b.axisDetails) {
            // Sort primarily by y
            if (a.axisDetails.y !== b.axisDetails.y) {
                return a.axisDetails.y - b.axisDetails.y;
            }
            // Sort secondarily by x
            return a.axisDetails.x - b.axisDetails.x;
        }
        return 0; // if axisDetails is missing, treat them as equal
    });

    return config;
}
