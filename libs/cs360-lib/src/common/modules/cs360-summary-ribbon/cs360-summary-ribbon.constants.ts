import {DataTypes} from "../../cs360.defaults";

export function getSampleDataForSummaryRibbonView(datatype: string = 'NUMBER') {
    switch(datatype.toUpperCase()) {
        case DataTypes.CURRENCY:
            return {
                "id": "Summary_ARR",
                "name": "ARR",
                "finalValue": "USD 11.61M",
                "value": 11609105,
                "prefix": "USD",
                "suffix": "M"
            };
        case DataTypes.NUMBER:
            return {
                "id": "Summary_OPEN_CTAS",
                "name": "Open CTAs",
                "finalValue": "0",
                "value": "0"
            };
        default:
            return {
                "id": "",
                "finalValue": "NA",
                "value": 11609105
            }
    }
}

//360.admin.summary_ribbon.dissatisfied = Dissatisfied: 4
//360.admin.summary_ribbon.satisfied = Satisfied: 9
//360.admin.summary_ribbon.neutral = Neutral: 1

export function getSampleWidgetDataForSummaryRibbonView(label: string, attributeId: string) {
    switch (attributeId) {
        case 'Health_Score':
            return {
                "id": attributeId,
                "label": label,
                "value": 64.3,
                "suffix": "%",
                "trend": {},
                "color": "#59D7A5",
                "visualization": {
                    "type": "bar",
                    "sum": {
                        "id": 'final_value',
                        "finalValue": "14",
                        "value": "14",
                        "color": "#19232F"
                    },
                    "values": [
                        {
                            "label": "dissatisfied",
                            "value": 4,
                            "color": "#FF837B",
                            "tooltip": "4 Relationships"
                        },
                        {
                            "label": "neutral",
                            "value": 1,
                            "color": "#FFC933",
                            "tooltip": "1 Relationships"
                        },
                        {
                            "label": "satisfied",
                            "value": 9,
                            "color": "#59D7A5",
                            "tooltip": "9 Relationships"
                        }
                    ]
                }
            }
        default:
            return {
                "id": attributeId,
                "name": label,
                "finalValue": "99",
                "value": "99"
            };
    }

}
