import { fixNilType } from '@mdapi-issues/listmetadata-standardvaluesettranslation-type/lib/workaround';
import { Connection, DescribeMetadataResult, FileProperties } from 'jsforce';
import { listMetadataInChunks } from '../jsforce-utils';
import MetadataLister from '../metadata-lister';

export default class RegularMetadata extends MetadataLister {
  public static id = 'regular';
  public async run(
    conn: Connection,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    describeMetadataResult: DescribeMetadataResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fileProperties: Array<FileProperties>
  ): Promise<Array<FileProperties>> {
    const metadataQueries = describeMetadataResult.metadataObjects.map(
      (cmp) => {
        return {
          type: cmp.xmlName
        };
      }
    );
    const filteredMetadataQueries = this.filter(
      metadataQueries,
      (x) => `${x.type}:`
    );
    let result = await listMetadataInChunks(conn, filteredMetadataQueries);
    result = fixNilType(result, describeMetadataResult);
    result = fixCustomFeedFilter(result);
    return result;
  }
}

export function fixCustomFeedFilter(
  fileProperties: Array<FileProperties>
): Array<FileProperties> {
  return fileProperties.map((fileProperty) => {
    if (fileProperty.type === 'CustomFeedFilter') {
      // Apparently the fullName returned in the FileProperties does not include the necessary Case prefix:
      // http://salesforce.stackexchange.com/questions/156714/listmetadata-query-of-type-customfeedfilter-returns-fullname-without-sobject
      if (fileProperty.fullName.indexOf('.') < 0) {
        fileProperty.fullName = 'Case.' + fileProperty.fullName;
      }
    }
    return fileProperty;
  });
}
