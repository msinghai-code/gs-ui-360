import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeConfigurationComponent } from './attribute-configuration.component';

describe('AttributeConfigurationComponent', () => {
  let component: AttributeConfigurationComponent;
  let fixture: ComponentFixture<AttributeConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributeConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
