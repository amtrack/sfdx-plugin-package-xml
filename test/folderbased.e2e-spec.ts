import { Org } from '@salesforce/core';
import { expect } from 'chai';
import { toMetadataComponentName } from '../src/metadata-component';
import FolderBasedMetadata from '../src/metadata-lister/folderbased';

const expected = [
  'EmailFolder:unfiled$public',
  'Report:FooReports/FooAccountsClassicReport',
  'Report:FooReports/FooAccountsLightningReport_vgv',
  'Report:FooSubReports/FooAccountsSubLightningReport_kgv',
  'Report:unfiled$public/flow_screen_prebuilt_report',
  'ReportFolder:EinsteinBotReports',
  'ReportFolder:FooReports',
  'ReportFolder:FooSubReports',
  'ReportFolder:unfiled$public'
];

describe('folderbased', function () {
  this.slow('30s');
  this.timeout('2m');
  describe('listFolderBasedMetadata()', () => {
    it('lists folders and files in folders', async () => {
      const org = await Org.create({});
      const conn = org.getConnection();
      const lister = new FolderBasedMetadata(['**/*'], []);
      const result = await lister.run(conn, null, []);
      expect(result.map(toMetadataComponentName).sort()).to.deep.equal(
        expected
      );
    });
  });
});
