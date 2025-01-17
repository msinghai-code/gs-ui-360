import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmRelationshipComponent } from './csm-relationship.component';

describe('CsmRelationshipComponent', () => {
  let component: CsmRelationshipComponent;
  let fixture: ComponentFixture<CsmRelationshipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmRelationshipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmRelationshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
