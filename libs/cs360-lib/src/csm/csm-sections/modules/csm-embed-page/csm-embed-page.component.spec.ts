import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsmEmbedPageComponent } from './csm-embed-page.component';

describe('CsmEmbedPageComponent', () => {
  let component: CsmEmbedPageComponent;
  let fixture: ComponentFixture<CsmEmbedPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsmEmbedPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsmEmbedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
