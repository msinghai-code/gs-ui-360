import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipConfigurationComponent } from './relationship-configuration.component';

describe('RelationshipConfigurationComponent', () => {
  let component: RelationshipConfigurationComponent;
  let fixture: ComponentFixture<RelationshipConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelationshipConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationshipConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
