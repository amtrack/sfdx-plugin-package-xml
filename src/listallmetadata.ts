import { OutputFlags } from '@oclif/parser';
import { Connection } from '@salesforce/core';
import { FileProperties } from 'jsforce';
import { ignoreMatching } from './ignore';
import { toMetadataComponentName } from './metadata-component';
import ChildMetadataLister from './metadata-lister/children';
import FolderBasedMetadataLister from './metadata-lister/folderbased';
import RegularMetadataLister from './metadata-lister/regular';
import StandardValueSetMetadataLister from './metadata-lister/standardvaluesets';

export async function listAllMetadata(
  conn: Connection,
  flags: OutputFlags<any>
): Promise<Array<FileProperties>> {
  const describeMetadataResult = await conn.metadata.describe();
  const metadataListers = [
    RegularMetadataLister,
    FolderBasedMetadataLister,
    StandardValueSetMetadataLister,
    ChildMetadataLister
  ];
  // TODO: filter describeMetadataResult using ignorePatterns
  const result = [];
  for (const MetadataListerImplementation of metadataListers) {
    const listerId = MetadataListerImplementation.id;
    const instance = new MetadataListerImplementation();
    if (flags[listerId]) {
      const fileProperties = await instance.run(
        conn,
        describeMetadataResult,
        result
      );
      const [keep, ignored] = ignoreMatching(
        fileProperties,
        flags.ignore ? flags.ignore : [],
        toMetadataComponentName
      );
      if (ignored.length) {
        console.error(
          `ignored: ${JSON.stringify(ignored.map(toMetadataComponentName))}`
        );
      }
      result.push(...keep);
    }
  }
  return result;
}
