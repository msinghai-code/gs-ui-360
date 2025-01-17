
export class AbstractSectionProvider {
    getSectionView(type?: string, context?: any): any {
        throw new Error('Method not implemented');
    }
    getSectionSettingsView(context: any): any {
        throw new Error('Method not implemented');
    }
}
