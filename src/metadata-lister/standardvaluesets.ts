import { listStandardValueSets } from '@mdapi-issues/listmetadata-standardvalueset';
import type {
  Connection,
  DescribeMetadataResult,
  FileProperties
} from 'jsforce';
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
    const shouldRun =
      this.filter(['StandardValueSet'], (x) => `${x}:`).length > 0;
    if (shouldRun) {
      return await listStandardValueSets(conn);
    } else {
      return [];
    }
  }
}
