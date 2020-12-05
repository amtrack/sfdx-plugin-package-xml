import {
  fixPersonAccountRecordTypes,
  queryPersonAccountRecordTypes
} from '@mdapi-issues/listmetadata-recordtype-personaccount/lib/workaround';
import { Connection, DescribeMetadataResult, FileProperties } from 'jsforce';
import { flatten } from 'lodash';
import { listMetadataInChunks } from '../jsforce-utils';
import MetadataLister from '../metadata-lister';

export default class ChildrenMetadata extends MetadataLister {
  public static id = 'children';
  public async run(
    conn: Connection,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    describeMetadataResult: DescribeMetadataResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fileProperties: Array<FileProperties>
  ): Promise<Array<FileProperties>> {
    const metadataTypesWithChildren = describeMetadataResult.metadataObjects.filter(
      (metadataType) => metadataType.childXmlNames
    );
    const childMetadataTypes = flatten(
      metadataTypesWithChildren.map((type) => type.childXmlNames)
    );
    const childMetadataQueries = childMetadataTypes.map((childMetadataType) => {
      return { type: childMetadataType };
    });
    let result = await listMetadataInChunks(conn, childMetadataQueries);
    let personAccountRecordTypes = [];
    try {
      personAccountRecordTypes = await queryPersonAccountRecordTypes(conn);
    } catch (e) {
      // ignore errors here since the query only succeeds when PersonAccounts are enabled
    }
    result = fixPersonAccountRecordTypes(result, personAccountRecordTypes);
    return result;
  }
}