import { expect } from 'chai';
import { transformFolderToType } from '../src/metadata-folder';

describe('metadata-folder', () => {
  describe('transformFolderToType()', () => {
    it('transforms a folder type to the type of its content', () => {
      expect(transformFolderToType('ReportFolder')).to.equal('Report');
    });
    it('does not transform non-folder types', () => {
      expect(transformFolderToType('ApexClass')).to.equal('ApexClass');
    });
  });
});
