import { expect } from 'chai';
import { match } from '../src/match';

describe('match', () => {
  describe('match()', () => {
    it('matches using a single pattern', () => {
      expect(
        match(
          ['InstalledPackage:Foo', 'CustomObject:Account'],
          ['InstalledPackage:*']
        )
      ).to.deep.equal([['InstalledPackage:Foo'], ['CustomObject:Account']]);
    });
    it('matches using multiple patterns', () => {
      expect(
        match(
          ['InstalledPackage:Foo', 'CustomObject:Account'],
          ['InstalledPackage:*', 'CustomObject:*']
        )
      ).to.deep.equal([['InstalledPackage:Foo', 'CustomObject:Account'], []]);
    });
    it('matches everything but InstalledPackages', () => {
      expect(
        match(
          ['InstalledPackage:Foo', 'CustomObject:Account'],
          ['!(InstalledPackage:*)']
        )
      ).to.deep.equal([['CustomObject:Account'], ['InstalledPackage:Foo']]);
    });
    it('matches everything but InstalledPackages and not Bar', () => {
      expect(
        match(
          [
            'InstalledPackage:Foo',
            'InstalledPackage:Bar',
            'CustomObject:Account'
          ],
          ['!(InstalledPackage:*)', 'InstalledPackage:Bar']
        )
      ).to.deep.equal([
        ['InstalledPackage:Bar', 'CustomObject:Account'],
        ['InstalledPackage:Foo']
      ]);
    });
    it('matches using ignore list', () => {
      expect(
        match(
          [
            'InstalledPackage:Foo',
            'InstalledPackage:Bar',
            'CustomObject:Account'
          ],
          ['**/*'],
          (x) => x,
          { ignore: ['InstalledPackage:Foo'] }
        )
      ).to.deep.equal([
        ['InstalledPackage:Bar', 'CustomObject:Account'],
        ['InstalledPackage:Foo']
      ]);
    });
    it('matches using a collection with a toString function', () => {
      expect(
        match(
          [
            { type: 'InstalledPackage', fullName: 'Foo' },
            { type: 'CustomObject', fullName: 'Account' }
          ],
          ['InstalledPackage:*'],
          (x) => `${x.type}:${x.fullName}`
        )
      ).to.deep.equal([
        [{ type: 'InstalledPackage', fullName: 'Foo' }],
        [{ type: 'CustomObject', fullName: 'Account' }]
      ]);
    });
  });
});
