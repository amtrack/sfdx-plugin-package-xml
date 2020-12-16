import { expect } from 'chai';
import {
  parseCommaSeparatedValues,
  parseNewLineSeparatedValues
} from '../src/cli';

describe('cli', () => {
  describe('parseCommaSeparatedValues()', () => {
    it('parses comma-separated values', () => {
      expect(
        parseCommaSeparatedValues(' CustomObject:Account , ApexPage:Foo')
      ).to.deep.equal(['CustomObject:Account', 'ApexPage:Foo']);
    });
  });
  describe('parseNewLineSeparatedValues()', () => {
    it('parses newline-separated values', () => {
      const input = `CustomObject:Account
      ApexPage:Foo
      `;
      expect(parseNewLineSeparatedValues(input)).to.deep.equal([
        'CustomObject:Account',
        'ApexPage:Foo'
      ]);
    });
  });
});
