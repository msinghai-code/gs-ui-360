
import {DataTypes} from "../../cs360.defaults";

// 360.admin.card_view.notAvailable = Not Available

export function getSampleDataForCardView(datatype: string, i18nService) {
    switch(datatype.toUpperCase()) {
        case DataTypes.CURRENCY:
            return "$141,332";
        case DataTypes.NUMBER:
            return "141,332";
        case DataTypes.STRING:
            return "Gainsight";
        case DataTypes.DATE:
        case DataTypes.DATETIME:
            return "4/1/2021";
        case DataTypes.BOOLEAN:
            return i18nService.translate('360.admin.boolean_options.true');
        case DataTypes.URL:
            return "https://www.gainsight.com"
        case DataTypes.GSID:
        case DataTypes.SFDCID:
            return "1P02F2ULMFMT4A1R5FAB42RLXZ64ZU7HHEAA";
        default:
            return i18nService.translate('360.admin.card_view.notAvailable')
    }
}

export function getSampleHeathScoreData() {
    return {
        "fv": "1I006DJFN3G1BN0L9A06SZG20I3NC8WCUYU6",
        "v": "1I006DJFN3G1BN0L9A06SZG20I3NC8WCUYU6",
        "properties": {
            "score": 65,
            "color": "#ff8f00",
            "trend": "-1",
            "propertyName": "ScoreTrend",
            "label": "50-75"
        }
    };
}
