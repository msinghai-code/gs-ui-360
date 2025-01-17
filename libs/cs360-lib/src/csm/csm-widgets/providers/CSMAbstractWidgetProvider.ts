import { BaseWidgetComponent } from "@gs/gdk/widget-viewer";

export class AbstractWidgetProvider {
    getWidgetView(context: any, type?: string): (typeof BaseWidgetComponent) {
        throw new Error('Method not implemented');
    }
    getWidgetSettingsView(context: any): any {
        throw new Error('Method not implemented');
    }
}
