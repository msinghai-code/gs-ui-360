import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmCompanyHierarchyComponent } from './csm-company-hierarchy.component';

describe('CsmCompanyHierarchyComponent', () => {
  let component: CsmCompanyHierarchyComponent;
  let fixture: ComponentFixture<CsmCompanyHierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmCompanyHierarchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmCompanyHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
