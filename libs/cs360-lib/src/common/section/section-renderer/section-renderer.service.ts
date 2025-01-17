import { Injectable } from '@angular/core';
import { QuickActionContext } from '../../pojo/quick-actions';
import { BehaviorSubject,  Subject, Observable } from 'rxjs';
import {ISection} from "./section-renderer";

@Injectable({
    providedIn: 'root'
})

export class SectionRendererService {

    private renderSectionSubject = new BehaviorSubject<any>(null);
    private quickActionCreatedSubject = new Subject<QuickActionContext>();
    private tabSelect = new Subject<any>();

    setSectionToRender(section: ISection) {
        this.renderSectionSubject.next(section);
    }

    getRenderSubjectAsObservable(): Observable<any>{ 
        return this.renderSectionSubject.asObservable();
    }

    setQuickActionCreated(action: QuickActionContext) {
        this.quickActionCreatedSubject.next(action);
    }

    getQuickActionCreatedSubjectAsObservable(): Observable<any>{ 
        return this.quickActionCreatedSubject.asObservable();
    }

    setActiveTab(id) {
        this.tabSelect.next(id);
    }
    getTabSelectAsObservable() {
        return this.tabSelect.asObservable();
    }
}
