export const FOLDER_BASED_METADATA_MAP = {
  EmailFolder: 'EmailTemplate',
  DashboardFolder: 'Dashboard',
  DocumentFolder: 'Document',
  ReportFolder: 'Report'
};

/**
 * transform a folder type to the type of its content
 * @param type metadata type (e.g. 'EmailFolder')
 */
export function transformFolderToType(type: string): string {
  if (Object.keys(FOLDER_BASED_METADATA_MAP).includes(type)) {
    return FOLDER_BASED_METADATA_MAP[type];
  }
  return type;
}
