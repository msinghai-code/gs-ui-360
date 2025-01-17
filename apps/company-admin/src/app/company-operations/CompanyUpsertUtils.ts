import { DEFAULT_FIELDS_ORDER_MAP, DataTypes, DISABLED_FIELDS, NUMBER_OF_STANDARD_FIELDS, MappingObjects, DEFAULT_COLUMNS, DEFAULT_MAPPINGS } from "./constants";
import { sortBy, orderBy, filter, includes, concat, map, cloneDeep, get } from "lodash";
import { AppInjector } from "@gs/core";
import { NzI18nService } from "@gs/ng-horizon/i18n";

export class CompanyUpsertUtils {
    static regroupFields(schema) {
        // breaking the fields by field group type
        // standard, custom, system
        const {
          fields,
          cdcEnabled,
          dataStore,
          dbName,
          keyPrefix,
          label,
          labelPlural,
          objectId,
          objectName,
          objectType,
          source
        } = schema;

        const fieldMap = {};
        fields.forEach(field => {
          fieldMap[field.fieldName] = field;
        });
        let numberOfStandardFields = NUMBER_OF_STANDARD_FIELDS;

          const grouped = (fields || []).reduce((v, c) => {
            let fieldGroupType = c.meta.fieldGroupType;
            fieldGroupType = fieldGroupType === 'SYSTEM' ? 'STANDARD' : fieldGroupType;

            v[fieldGroupType] = v[fieldGroupType] || {
              cdcEnabled,
              dataStore,
              dbName,
              keyPrefix,
              label,
              labelPlural,
              objectId,
              objectName,
              objectType,
              source,
              groupName: c.meta.fieldGroupType,
              fields: [],
              colGroups: []
            };
            if(fieldGroupType === "STANDARD" && c.dataType !== DataTypes.RICHTEXTAREA) {
              c.displayOrder = DEFAULT_FIELDS_ORDER_MAP[c.fieldName.toUpperCase()] ? DEFAULT_FIELDS_ORDER_MAP[c.fieldName.toUpperCase()] : numberOfStandardFields++;
            }
            if((c.dataType === DataTypes.MULTISELECTDROPDOWNLIST || c.dataType === DataTypes.PICKLIST) && c.options) {
              c.options = c.options.filter(f => f.active);
            }
            c.meta.length = CompanyUpsertUtils.getMaxLength(c.dataType);
            if (c.fieldName === 'Name')
              v[fieldGroupType].fields.unshift(c);
            else
              v[fieldGroupType].fields.push(c);
            return v;
          }, {});
          const sections = [];
          Object.keys(grouped).forEach(key => {
            let keylabel;
            if(key === "STANDARD") {
              const  tService = AppInjector.get(NzI18nService);
              keylabel = tService.translate('360.admin.company_admin.standard')
              grouped[key].fields = sortBy(grouped[key].fields, 'displayOrder');
              const disabledFields = [];
              let sortedFields = [];
              map(grouped[key].fields, field => {
                if(includes(DISABLED_FIELDS, field.fieldName.toUpperCase())) {
                  disabledFields.push(field);
                } else {
                  sortedFields.push(field);
                }
              });
              sortedFields = concat(sortedFields, disabledFields);
              sections.unshift({
                objectName: schema.objectName,
                source : schema.source,
                label: keylabel,
                columns: [{
                  attributes: sortedFields
                }]
              });
            } else {
              grouped[key].fields = orderBy(grouped[key].fields, f => f.label.toUpperCase(), ['asc']);
              //{360.admin.company_admin.standard}=STANDARD
              //{360.admin.company_admin.custom}= CUSTOM
              if ( key == 'CUSTOM'){
               const  tService = AppInjector.get(NzI18nService);
                keylabel = tService.translate('360.admin.company_admin.custom')
             }
              sections.push({
                objectName: schema.objectName,
                source : schema.source,
                label: keylabel,
                columns: [{
                  attributes: grouped[key].fields
                }]
              });
            }
          });
          return {
            objectName: schema.objectName,
            sections
          };

      }

      static getEditFields(objectDefinition, editable) {
        const editsAllowed = {};

        ((objectDefinition.fields as any[]) || []).forEach(
          (f) => {
            const { lookupDetail, hasLookup } = f.meta;
            editsAllowed[f.fieldName] = !f.meta.readOnly && editable;
          }
        );
        return editsAllowed;
      }

      static remapAllFieldsData(schema, record) {
        const {fields} = schema;

        return (fields || []).reduce((r, c) => {
          const { fieldName, meta, dataType, options = [] } = c;
          const { lookupDetail, hasLookup } = meta;
          r[fieldName] = record[fieldName];

          if (fieldName === "Name")
            meta.required = true; // FIXME: forcing temporily to check validations
            meta.properties = meta.properties || {}; // FIXME: forcing temporily to skip formatting errors

          if (hasLookup) {
            const lookupFieldName = lookupDetail.lookupName + '.Name';
            r[fieldName] = { name: record[lookupFieldName], gsid: r[fieldName] };
          } else if(CompanyUpsertUtils.isIndirectLookup(c)) {
            r[fieldName] = { name: r[fieldName], gsid: r[fieldName] };
          } else if (dataType === "PICKLIST") {

            // the formatter pipe functionality of picklist type
            // it is implemented against the data contract {Label, Value} (Global Search api)
            // Query api returns {label, value}
            options.forEach(o => {
              o.Label = o.label;
              o.Value = o.value;
            });

            if (r[fieldName]) {
              // assign the option object to the value came from the server
              r[fieldName] = options.find(({ value }) => value === r[fieldName]);
            }

          } else if (dataType === "MULTISELECTDROPDOWNLIST") {

            // the formatter pipe functionality of multipicklist type
            // it is implemented against the data contract {Label, Value} (Global Search api)
            // Query api returns {label, value}
            options.forEach(o => {
              o.Label = o.label;
              o.Value = o.value;
            });

            if (r[fieldName]) {
              // assign the option object to the value came from the server
              // Read API returns string;string;string;string;
              // Update API returns [string, string, string]
              r[fieldName] = typeof r[fieldName] === "string"
                ? (r[fieldName] || "").split(";")
                : Array.isArray(r[fieldName]) ? r[fieldName] : [];
              r[fieldName] = options.filter(({ value }) => r[fieldName].indexOf(value) > -1);
            }

          } else if (['DATE', 'DATETIME'].indexOf(dataType) > -1) {

            if (r[fieldName]) {
              r[fieldName] = r[fieldName];
            } else {
              r[fieldName] = null;
            }

          }
          return r;
        }, {});
      }

      static formUpdatePayload(payload: {value: any; fields: any}) {
        Object
        .keys(payload.value)
        .forEach(key => {
        const field = payload.fields.find(f => f.fieldName === key);
        if (!field) {
          throw (new Error("Field Not Found for the Key: " + key));
        }
        if (field.dataType === DataTypes.LOOKUP || CompanyUpsertUtils.isIndirectLookup(field)) {
          if (payload.value[key]) {
            // Instead of gsid, use the field as key on which lookup was created
            const fieldNameKey = get(field, 'meta.lookupDetail.fieldName');
            payload.value[key] = fieldNameKey ? payload.value[key][fieldNameKey.toLowerCase()] : payload.value[key].gsid;
          }
        } else if(field.dataType === DataTypes.MULTISELECTDROPDOWNLIST && (!payload.value[key] || (payload.value[key] && !payload.value[key].length))) {
          payload.value[key] = null;
        } else if(field.dataType === DataTypes.PICKLIST && !payload.value[key]) {
          payload.value[key] = null;
        }
        if(field.meta.formulaField){
          delete payload.value[key];
        }
        if(field.meta.readOnly && field.fieldName.toUpperCase() !== "GSID") {
          delete payload.value[key]; //TODO: Logic to be removed from here
        }
      });

      }

      static getLookupObject(field: any) {
        let objectName: string;
        if(field && field.meta) {
          if(field.meta.lookupDetail && field.meta.lookupDetail.lookupObjects[0]) {
            objectName = field.meta.lookupDetail && field.meta.lookupDetail.lookupObjects[0] && field.meta.lookupDetail.lookupObjects[0].objectName;
          } else if(!includes(DEFAULT_COLUMNS, field.fieldName)) {
            objectName = field.meta.mappings && field.meta.mappings.GAINSIGHT && MappingObjects[field.meta.mappings.GAINSIGHT.key];
          }
        }
        return objectName;
      }

      static getMaxLength(dataType: string) {
        if(dataType === DataTypes.RICHTEXTAREA) {
          return 150000;
        }
        if(dataType === DataTypes.STRING) {
            return 255;
        }

        return 8000;
      }

      static isIndirectLookup(field: any) {
        if(field && field.meta && field.meta.originalDataType === "lookup") {
          return true;
        } else if(!includes(DEFAULT_MAPPINGS, field.fieldName) && field.meta && field.meta.mappings && field.meta.mappings.GAINSIGHT && MappingObjects[field.meta.mappings.GAINSIGHT.key]){
          return true;
        }
        return false;
      }

    static getMappedOptions(response: any, selectedControllerId: any, options: any) {
        const dependencyIds = response[0].mappedItems.map(mappedItem => {
            if(mappedItem.controllerId === selectedControllerId) {
                return mappedItem.dependentId;
            }
        });
        return cloneDeep(options.filter(option => includes(dependencyIds, option.value)));
    }

    static getUrlValidator(control) {
      if(!control.value) {
          return null;
      }
      return /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.%]+$/.test(control.value) ? null : { 'url': true };
    };
}
