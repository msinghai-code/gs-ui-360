import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmAttributeGroupComponent } from './csm-attribute-group.component';

describe('CsmAttributeGroupComponent', () => {
  let component: CsmAttributeGroupComponent;
  let fixture: ComponentFixture<CsmAttributeGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmAttributeGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmAttributeGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
