import { TestBed } from '@angular/core/testing';

import { SummaryConfigurationService } from './summary-configuration.service';

describe('SummaryConfigurationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SummaryConfigurationService = TestBed.get(SummaryConfigurationService);
    expect(service).toBeTruthy();
  });
});
