import { expect } from 'chai';
import {
  parseMetadataComponentName,
  toMetadataComponentName
} from '../src/metadata-component';

describe('metadata-component', () => {
  describe('parseMetadataComponentName()', () => {
    it('parses a metadata component name', () => {
      expect(parseMetadataComponentName('CustomObject:Account')).to.deep.equal({
        type: 'CustomObject',
        fullName: 'Account'
      });
    });
    const invalidSyntaxTests = ['', '::', 'CustomObject:', ':Account'];
    for (const invalidSyntaxTest of invalidSyntaxTests) {
      it(`fails to parse "${invalidSyntaxTest}"`, () => {
        expect(() => {
          parseMetadataComponentName(invalidSyntaxTest);
        }).to.throw(/Invalid syntax of metadata component name/);
      });
    }
  });
  describe('toMetadataComponentName()', () => {
    it('formats a metadata component as string', () => {
      expect(
        toMetadataComponentName({
          type: 'CustomObject',
          fullName: 'Account'
        })
      ).to.deep.equal('CustomObject:Account');
    });
    it('fails to format an invalid metadata component as string', () => {
      expect(() => {
        toMetadataComponentName({
          type: '',
          fullName: 'Account'
        });
      }).to.throw(/is not a valid MetadataComponent/);
    });
  });
});
