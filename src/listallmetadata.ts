import type { Connection } from "@salesforce/core";
import type { FileProperties } from "jsforce/api/metadata";
import { match } from "./match";
import { toMetadataComponentName } from "./metadata-component";
import { ChildrenMetadata } from "./metadata-lister/children";
import { FolderBasedMetadata } from "./metadata-lister/folderbased";
import { RegularMetadata } from "./metadata-lister/regular";
import { StandardValueSetLister } from "./metadata-lister/standardvaluesets";

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
