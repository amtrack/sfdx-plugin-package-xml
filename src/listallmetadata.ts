import type { OutputFlags } from "@oclif/core/lib/interfaces";
import type { Connection } from "@salesforce/core";
import type { FileProperties } from "jsforce/api/metadata";
import { match } from "./match";
import { toMetadataComponentName } from "./metadata-component";
import ChildMetadataLister from "./metadata-lister/children";
import FolderBasedMetadataLister from "./metadata-lister/folderbased";
import RegularMetadataLister from "./metadata-lister/regular";
import StandardValueSetMetadataLister from "./metadata-lister/standardvaluesets";

export async function listAllMetadata(
  conn: Connection,
  flags: OutputFlags<any>,
  allowPatterns?: Array<string>,
  ignorePatterns?: Array<string>
): Promise<Array<FileProperties>> {
  const describeMetadataResult = await conn.metadata.describe();
  const metadataListers = [
    RegularMetadataLister,
    FolderBasedMetadataLister,
    StandardValueSetMetadataLister,
    ChildMetadataLister,
  ];
  const result = [];
  for (const MetadataListerImplementation of metadataListers) {
    const listerId = MetadataListerImplementation.id;
    const instance = new MetadataListerImplementation(
      allowPatterns,
      ignorePatterns
    );
    if (flags[listerId]) {
      const fileProperties = await instance.run(
        conn,
        describeMetadataResult,
        result
      );
      // postfilter
      const [matches] = match(
        fileProperties,
        allowPatterns,
        toMetadataComponentName,
        { ignore: ignorePatterns }
      );
      result.push(...matches);
    }
  }
  return result;
}
