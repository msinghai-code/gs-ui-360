import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyHierarchyConfigurationComponent } from './company-hierarchy-configuration.component';

describe('CompanyHierarchyConfigurationComponent', () => {
  let component: CompanyHierarchyConfigurationComponent;
  let fixture: ComponentFixture<CompanyHierarchyConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyHierarchyConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyHierarchyConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
