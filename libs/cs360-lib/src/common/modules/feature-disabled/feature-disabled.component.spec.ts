import { async, ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:libs/cs360-lib/src/core-references/token-field/token-field.component.spec.ts
import { TokenFieldComponent } from './token-field.component';

describe('TokenFieldComponent', () => {
  let component: TokenFieldComponent;
  let fixture: ComponentFixture<TokenFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenFieldComponent ]
========
import { FeatureDisabledComponent } from './feature-disabled.component';

describe('FeatureDisabledComponent', () => {
  let component: FeatureDisabledComponent;
  let fixture: ComponentFixture<FeatureDisabledComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureDisabledComponent ]
>>>>>>>> release:libs/cs360-lib/src/common/modules/feature-disabled/feature-disabled.component.spec.ts
    })
    .compileComponents();
  }));

  beforeEach(() => {
<<<<<<<< HEAD:libs/cs360-lib/src/core-references/token-field/token-field.component.spec.ts
    fixture = TestBed.createComponent(TokenFieldComponent);
========
    fixture = TestBed.createComponent(FeatureDisabledComponent);
>>>>>>>> release:libs/cs360-lib/src/common/modules/feature-disabled/feature-disabled.component.spec.ts
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
