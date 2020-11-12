import { expect } from 'chai';
import { ignoreMatching } from '../src/ignore';

describe('ignore', () => {
  describe('ignoreMatching()', () => {
    it('ignores using a single pattern', () => {
      expect(
        ignoreMatching(
          ['InstalledPackage:Foo', 'CustomObject:Account'],
          ['InstalledPackage:*']
        )
      ).to.deep.equal([['CustomObject:Account'], ['InstalledPackage:Foo']]);
    });
    it('ignores using multiple patterns', () => {
      expect(
        ignoreMatching(
          ['InstalledPackage:Foo', 'CustomObject:Account'],
          ['InstalledPackage:*', 'CustomObject:*']
        )
      ).to.deep.equal([[], ['InstalledPackage:Foo', 'CustomObject:Account']]);
    });
    it('ignores everything but InstalledPackages', () => {
      expect(
        ignoreMatching(
          ['InstalledPackage:Foo', 'CustomObject:Account'],
          ['!(InstalledPackage:*)']
        )
      ).to.deep.equal([['InstalledPackage:Foo'], ['CustomObject:Account']]);
    });
    it('ignores everything but InstalledPackages and not Bar', () => {
      expect(
        ignoreMatching(
          [
            'InstalledPackage:Foo',
            'InstalledPackage:Bar',
            'CustomObject:Account'
          ],
          ['!(InstalledPackage:*)', 'InstalledPackage:Bar']
        )
      ).to.deep.equal([
        ['InstalledPackage:Foo'],
        ['InstalledPackage:Bar', 'CustomObject:Account']
      ]);
    });
    it('handles a collection with a toString function', () => {
      expect(
        ignoreMatching(
          [
            { type: 'InstalledPackage', fullName: 'Foo' },
            { type: 'CustomObject', fullName: 'Account' }
          ],
          ['InstalledPackage:*'],
          (x) => `${x.type}:${x.fullName}`
        )
      ).to.deep.equal([
        [{ type: 'CustomObject', fullName: 'Account' }],
        [{ type: 'InstalledPackage', fullName: 'Foo' }]
      ]);
    });
  });
});
