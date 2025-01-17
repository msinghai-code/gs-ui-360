import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickLeadComponent } from './quick-lead.component';

describe('QuickLeadComponent', () => {
    let component: QuickLeadComponent;
    let fixture: ComponentFixture<QuickLeadComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ QuickLeadComponent ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuickLeadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
