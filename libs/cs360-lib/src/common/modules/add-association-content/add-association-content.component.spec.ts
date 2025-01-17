import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAssociationContentComponent } from './add-association-content.component';

describe('AddAssociationContentComponent', () => {
  let component: AddAssociationContentComponent;
  let fixture: ComponentFixture<AddAssociationContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAssociationContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAssociationContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
