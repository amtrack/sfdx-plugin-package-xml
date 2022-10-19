import { addMissingNamespace } from '@mdapi-issues/listmetadata-installed-missing-namespaceprefix';
import { fixNilType } from '@mdapi-issues/listmetadata-standardvaluesettranslation-type';
import type { Connection } from "@salesforce/core";
import type {
  DescribeMetadataResult,
  FileProperties
} from "jsforce/api/metadata";
import { listMetadataInChunks } from '../jsforce-utils';
import MetadataLister from '../metadata-lister';

export default class RegularMetadata extends MetadataLister {
  public static id = 'regular';
  public async run(
    conn: Connection,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    describeMetadataResult: DescribeMetadataResult,
  ): Promise<Array<FileProperties>> {
    const metadataQueries = describeMetadataResult.metadataObjects.map(
      (cmp) => {
        return {
          type: cmp.xmlName
        };
      }
    );
    const filteredMetadataQueries = this.filterTypes(
      metadataQueries,
      (x) => `${x.type}`
    );
    let result = await listMetadataInChunks(conn, filteredMetadataQueries);
    result = fixNilType(result, describeMetadataResult);
    result = addMissingNamespace(result);
    result = fixCustomFeedFilter(result);
    result = ignoreFlowDefinition(result, conn.version);
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

export function ignoreFlowDefinition(
  fileProperties: FileProperties[],
  apiVersion: string
): FileProperties[] {
  if (apiVersion >= '44.0') {
    return fileProperties.filter(
      (fileProperty) => fileProperty.type !== 'FlowDefinition'
    );
  }
  return fileProperties;
}
