import type {
  Connection,
  DescribeMetadataResult,
  FileProperties
} from 'jsforce';
import { match, ToStringFunction } from './match';

export interface IMetadataLister {
  id: string;
  run: (
    conn: Connection,
    describeMetadataResult: DescribeMetadataResult,
    fileProperties: Array<FileProperties>,
    allowPatterns: Array<string>,
    ignorePatterns: Array<string>
  ) => Promise<Array<FileProperties>>;
}

export default abstract class MetadataLister {
  public static id: string;
  private allowPatterns: Array<string>;
  private ignorePatterns: Array<string>;

  constructor(allowPatterns: Array<string>, ignorePatterns: Array<string>) {
    this.allowPatterns = allowPatterns;
    this.ignorePatterns = ignorePatterns;
  }

  abstract run(
    conn: Connection,
    describeMetadataResult: DescribeMetadataResult,
    fileProperties: Array<FileProperties>
  ): Promise<Array<FileProperties>>;

  public filter(items: Array<any>, toString?: ToStringFunction): Array<any> {
    const [matched] = match(items, this.allowPatterns, toString, {
      ignore: this.ignorePatterns
    });
    return matched;
  }

  public filterTypes(
    items: Array<any>,
    toString?: ToStringFunction
  ): Array<any> {
    const [matched] = match(
      items,
      this.allowPatterns.map((pattern) => pattern.split(':')[0]),
      toString,
      {
        ignore: this.ignorePatterns.map((pattern) => pattern.split(':')[0])
      }
    );
    return matched;
  }
}
