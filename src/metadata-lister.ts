import type { DescribeMetadataResult, FileProperties } from "jsforce/api/metadata";
import type { Connection } from "@salesforce/core";
import { match, ToStringFunction } from "./match";
import { parseMetadataComponentName, simplifyMetadataComponentPattern } from "./metadata-component";

export interface IMetadataLister {
  id: string;
  run: (
    conn: Connection,
    describeMetadataResult?: DescribeMetadataResult,
    fileProperties?: FileProperties[],
    allowPatterns?: string[],
    ignorePatterns?: string[],
  ) => Promise<FileProperties[]>;
}

export abstract class MetadataLister {
  public static id: string;
  private allowPatterns: string[];
  private ignorePatterns: string[];

  constructor(allowPatterns: string[], ignorePatterns: string[]) {
    this.allowPatterns = allowPatterns;
    this.ignorePatterns = ignorePatterns;
  }

  abstract run(
    conn: Connection,
    describeMetadataResult?: DescribeMetadataResult,
    fileProperties?: FileProperties[],
  ): Promise<FileProperties[]>;

  public filter(items: any[], toString?: ToStringFunction): any[] {
    const [matched] = match(items, this.allowPatterns, toString, {
      ignore: this.ignorePatterns,
    });
    return matched;
  }

  public filterTypes(items: any[], toString?: ToStringFunction): any[] {
    const [matched] = match(
      items,
      // allow type when the pattern contains the type
      this.allowPatterns.map((pattern) => parseMetadataComponentName(pattern).type),
      toString,
      {
        // ignore type only when the pattern is a wildcard for this type
        ignore: this.ignorePatterns.map(simplifyMetadataComponentPattern),
      },
    );
    return matched;
  }
}
