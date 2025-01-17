import { MergeModule } from './merge.module';

describe('MergeModule', () => {
  let mergeModule: MergeModule;

  beforeEach(() => {
    mergeModule = new MergeModule();
  });

  it('should create an instance', () => {
    expect(mergeModule).toBeTruthy();
  });
});
