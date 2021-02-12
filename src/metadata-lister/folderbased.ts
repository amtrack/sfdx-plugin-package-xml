import type {
  Connection,
  DescribeMetadataResult,
  FileProperties
} from 'jsforce';
import { listMetadataInChunks } from '../jsforce-utils';
import MetadataLister from '../metadata-lister';

export const FOLDER_BASED_METADATA_MAP = {
  EmailFolder: 'EmailTemplate',
  DashboardFolder: 'Dashboard',
  DocumentFolder: 'Document',
  ReportFolder: 'Report'
};

export default class FolderBasedMetadata extends MetadataLister {
  public static id = 'folderbased';
  public async run(
    conn: Connection,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    describeMetadataResult: DescribeMetadataResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fileProperties: Array<FileProperties>
  ): Promise<Array<FileProperties>> {
    const folderTypes = Object.keys(FOLDER_BASED_METADATA_MAP);
    const folderQueries = folderTypes.map((folderType) => {
      return {
        type: folderType
      };
    });
    const filteredFolderQueries = this.filter(
      folderQueries,
      (x) => `${x.type}:`
    );
    const folders = await listMetadataInChunks(conn, filteredFolderQueries);
    const inFolderQueries = folders.map((folder) => {
      return {
        type: FOLDER_BASED_METADATA_MAP[folder.type],
        folder: folder.fullName
      };
    });
    const filteredInFolderQueries = this.filter(
      inFolderQueries,
      (x) => `${x.type}:${x.folder}`
    );
    const inFolderFileProperties = await listMetadataInChunks(
      conn,
      filteredInFolderQueries
    );
    return [...folders, ...inFolderFileProperties];
  }
}
