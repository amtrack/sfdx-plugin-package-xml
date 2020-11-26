import { expect } from 'chai';
import { getMetadataComponentsFromStdinOrString } from '../src/cli';

describe('cli', () => {
  describe('getMetadataComponentsFromStdinOrString()', () => {
    it('parses comma-separated metadata component names from a string', async () => {
      expect(
        await getMetadataComponentsFromStdinOrString(
          'CustomObject:Account,ApexPage:Foo'
        )
      ).to.deep.equal([
        { type: 'CustomObject', fullName: 'Account' },
        { type: 'ApexPage', fullName: 'Foo' }
      ]);
    });
    it.skip('parses new-line delimited metadata component names from STDIN', async () => {
      process.stdin.isTTY = false;
      const promise = getMetadataComponentsFromStdinOrString('-');
      process.stdin.push('CustomObject:Account');
      process.stdin.push('ApexPage:Foo');
      process.stdin.emit('end');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(await promise).to.deep.equal([
        { type: 'CustomObject', fullName: 'Account' },
        { type: 'ApexPage', fullName: 'Foo' }
      ]);
    });
  });
});
