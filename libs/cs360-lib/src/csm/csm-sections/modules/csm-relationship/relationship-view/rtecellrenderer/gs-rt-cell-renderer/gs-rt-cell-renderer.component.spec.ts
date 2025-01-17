import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GsRTCellRendererComponent } from './gs-rt-cell-renderer.component';

describe('GsRtCellRendererComponent', () => {
  let component: GsRTCellRendererComponent;
  let fixture: ComponentFixture<GsRTCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GsRTCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GsRTCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
