import {
  RecordType,
  fixPersonAccountRecordTypes,
  queryPersonAccountRecordTypes,
} from "@mdapi-issues/listmetadata-recordtype-personaccount";
import { Connection } from "@salesforce/core";
import type { DescribeMetadataResult, FileProperties } from "jsforce/api/metadata";
import { flatten } from "lodash";
import { listMetadataInChunks } from "../jsforce-utils";
import { MetadataLister } from "../metadata-lister";

export class ChildrenMetadata extends MetadataLister {
  public static id = "children";
  public async run(
    conn: Connection,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    describeMetadataResult: DescribeMetadataResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fileProperties?: FileProperties[],
  ): Promise<FileProperties[]> {
    const metadataTypesWithChildren = describeMetadataResult.metadataObjects.filter(
      (metadataType) => metadataType.childXmlNames,
    );
    const childMetadataTypes = flatten(metadataTypesWithChildren.map((type) => type.childXmlNames));
    const childMetadataQueries = childMetadataTypes.map((childMetadataType) => {
      return { type: childMetadataType };
    });
    const filteredChildMetadataQueries = this.filterTypes(childMetadataQueries, (x) => `${x.type}`);
    let result = await listMetadataInChunks(conn, filteredChildMetadataQueries);
    let personAccountRecordTypes: RecordType[] = [];
    try {
      personAccountRecordTypes = await queryPersonAccountRecordTypes(conn);
    } catch (e) {
      // ignore errors here since the query only succeeds when PersonAccounts are enabled
    }
    result = fixPersonAccountRecordTypes(result, personAccountRecordTypes);
    return result;
  }
}
