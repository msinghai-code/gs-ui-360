import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyOperationsBaseComponent } from './company-operations-base.component';

describe('CompanyOperationsBaseComponent', () => {
  let component: CompanyOperationsBaseComponent;
  let fixture: ComponentFixture<CompanyOperationsBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyOperationsBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyOperationsBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
