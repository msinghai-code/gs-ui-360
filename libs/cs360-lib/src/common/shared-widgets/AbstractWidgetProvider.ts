import { BaseWidgetComponent } from "@gs/gdk/widget-viewer";

export class AbstractWidgetProvider {
    getWidgetView(type?: any): (typeof BaseWidgetComponent) {
        throw new Error('Method not implemented');
    }
    getWidgetSettingsView(): any {
        throw new Error('Method not implemented');
    }
    getWidgetSettingsWidth?(): number {
        throw new Error('Method not implemented');
    }
}
