import type { FileProperties } from "@jsforce/jsforce-node/lib/api/metadata.js";
import type { Connection } from "@salesforce/core";
import { match } from "./match.js";
import { toMetadataComponentName } from "./metadata-component.js";
import { ChildrenMetadata } from "./metadata-lister/children.js";
import { FolderBasedMetadata } from "./metadata-lister/folderbased.js";
import { RegularMetadata } from "./metadata-lister/regular.js";
import { StandardValueSetLister } from "./metadata-lister/standardvaluesets.js";

export async function listAllMetadata(
  conn: Connection,
  enabledListerIds: string[],
  allowPatterns?: string[],
  ignorePatterns?: string[],
): Promise<FileProperties[]> {
  const describeMetadataResult = await conn.metadata.describe();
  const metadataListers = [ChildrenMetadata, FolderBasedMetadata, RegularMetadata, StandardValueSetLister];
  const result: FileProperties[] = [];
  for (const MetadataListerImplementation of metadataListers) {
    const listerId = MetadataListerImplementation.id;
    const instance = new MetadataListerImplementation(allowPatterns ?? [], ignorePatterns ?? []);
    if (enabledListerIds.includes(listerId)) {
      const fileProperties = await instance.run(conn, describeMetadataResult, result);
      // postfilter
      const [matches] = match(fileProperties, allowPatterns ?? [], toMetadataComponentName, { ignore: ignorePatterns });
      result.push(...matches);
    }
  }
  return result;
}
