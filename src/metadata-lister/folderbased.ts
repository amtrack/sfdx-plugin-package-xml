import type { FileProperties } from "@jsforce/jsforce-node/lib/api/metadata.js";
import type { Connection } from "@salesforce/core";
import { listMetadataInChunks } from "../jsforce-utils.js";
import { toMetadataComponentName } from "../metadata-component.js";
import { MetadataLister } from "../metadata-lister.js";

export const FOLDER_BASED_METADATA_MAP = {
  EmailFolder: "EmailTemplate",
  // Attention: DescribeMetadataResult does not list EmailTemplateFolder (for Lightning Email Templates as Metadata Type)
  // The only reference of EmailTemplateFolder is in the Metadata Coverage Report https://developer.salesforce.com/docs/metadata-coverage/54/EmailTemplateFolder/details
  EmailTemplateFolder: "EmailTemplate",
  DashboardFolder: "Dashboard",
  DocumentFolder: "Document",
  ReportFolder: "Report",
};

export class FolderBasedMetadata extends MetadataLister {
  public static id = "folderbased";
  public async run(conn: Connection): Promise<FileProperties[]> {
    const folderTypes = Object.keys(FOLDER_BASED_METADATA_MAP);
    const folderQueries = folderTypes.map((folderType) => {
      return {
        type: folderType,
      };
    });
    const filteredFolderQueries = this.filterTypes(folderQueries, (x) => `${x.type}`);
    const folders = await listMetadataInChunks(conn, filteredFolderQueries);
    // NOTE: To pre-filter (allow or ignore) Reports in a certain folder,
    // please use the expression `ReportFolder:unfiled$public`
    // instead of `Report:unfiled$public,Report:unfiled$public/*`
    const filteredFolders = this.filter(folders, toMetadataComponentName);
    const inFolderQueries = filteredFolders.map((folder) => {
      return {
        type: FOLDER_BASED_METADATA_MAP[folder.type],
        folder: folder.fullName,
      };
    });
    const inFolderFileProperties = await listMetadataInChunks(conn, inFolderQueries);
    return [...filteredFolders, ...inFolderFileProperties];
  }
}
