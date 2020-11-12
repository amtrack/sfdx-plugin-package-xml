import listStandardValueSets from '@mdapi-issues/listmetadata-standardvalueset/lib/workaround';
import { Connection, DescribeMetadataResult, FileProperties } from 'jsforce';
import MetadataLister from '../metadata-lister';

export default class StandardValueSetLister extends MetadataLister {
  public static id = 'standardvaluesets';
  public async run(
    conn: Connection,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    describeMetadataResult: DescribeMetadataResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fileProperties: Array<FileProperties>
  ): Promise<Array<FileProperties>> {
    return await listStandardValueSets(conn);
  }
}
