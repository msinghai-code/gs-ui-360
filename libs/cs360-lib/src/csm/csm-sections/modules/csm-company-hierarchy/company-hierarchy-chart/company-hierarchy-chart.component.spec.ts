import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyHierarchyChartComponent } from './company-hierarchy-chart.component';

describe('CompanyHierarchyCardComponent', () => {
  let component: CompanyHierarchyChartComponent;
  let fixture: ComponentFixture<CompanyHierarchyChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyHierarchyChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyHierarchyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
