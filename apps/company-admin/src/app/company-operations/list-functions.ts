import { PRIORITY_FIELD_NAMES, SORTABLE_FIELD_NAMES } from "./constants";

export function buildQuery(schema, where = null, orderBy = null) {
  const standard = schema.fields.filter(f => f.meta.fieldGroupType === "STANDARD").sort((a, b) => a.fieldName > b.fieldName ? -1 : a.fieldName < b.fieldName ? 1 : 0);

  if (standard.length > 0) {
    // out of standard, a few will be placed in the begining
    const first = standard.filter(f => PRIORITY_FIELD_NAMES.includes(f.fieldName.toUpperCase())).sort((a, b) => a.fieldName > b.fieldName ? -1 : a.fieldName < b.fieldName ? 1 : 0);

    schema.fields = [
      ...first,
      // out of standard, except the first, append remaining
      ...standard.filter(f => !PRIORITY_FIELD_NAMES.includes(f.fieldName.toUpperCase())),
      // then non standard
      ...schema.fields.filter(f => f.meta.fieldGroupType !== "STANDARD")
    ];
  }

  const allFieldNames = schema.fields.map(f => f.fieldName.toUpperCase());
  const gsIdFound = !!schema.fields.find(({ fieldName }) => fieldName === "Gsid");

  const isHidden = schema.fields.find(({ hidden }) => hidden);

  if (!isHidden) {
    if (standard.length > 0) {
      schema.fields.forEach(field => { field.hidden = true; });
      standard.forEach(field => { field.hidden = false; });
    } else {
      schema.fields.slice(0, 10).forEach(field => { field.hidden = false; });
    }
  }

  if (gsIdFound) {
    return {
      schema,
      query: {
        objectName: schema.objectName,
        "select": schema.fields.map(({ fieldName }) => fieldName),
        where,
        orderBy: SORTABLE_FIELD_NAMES.reduce((acc, s) => {
          if (allFieldNames.indexOf(s.toUpperCase()) > -1) {
            acc[s] = "asc";
          }
          return acc;
        }, {}),
        "limit": 100,
        "offset": 0
      }
    };
  } else {
    return {
      query: null,
      schema,
      notEditable: true
    };
  }
  
}
