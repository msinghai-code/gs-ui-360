import { ErrorReaderModule } from './error-reader.module';

describe('ErrorReaderModule', () => {
  let errorReaderModule: ErrorReaderModule;

  beforeEach(() => {
    errorReaderModule = new ErrorReaderModule();
  });

  it('should create an instance', () => {
    expect(errorReaderModule).toBeTruthy();
  });
});
