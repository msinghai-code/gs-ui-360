import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyUpsertComponent } from './company-upsert.component';

describe('CompanyUpsertComponent', () => {
  let component: CompanyUpsertComponent;
  let fixture: ComponentFixture<CompanyUpsertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyUpsertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyUpsertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
