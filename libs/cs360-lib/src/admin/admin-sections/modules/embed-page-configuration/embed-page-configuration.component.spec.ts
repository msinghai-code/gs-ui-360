import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbedPageConfigurationComponent } from './embed-page-configuration.component';

describe('EmbedPageConfigurationComponent', () => {
  let component: EmbedPageConfigurationComponent;
  let fixture: ComponentFixture<EmbedPageConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmbedPageConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbedPageConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
