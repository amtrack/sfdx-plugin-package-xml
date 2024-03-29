import { listStandardValueSets } from "@mdapi-issues/listmetadata-standardvalueset";
import type { Connection } from "@salesforce/core";
import type { FileProperties } from "jsforce/api/metadata";
import { MetadataLister } from "../metadata-lister";

export class StandardValueSetLister extends MetadataLister {
  public static id = "standardvaluesets";
  public async run(conn: Connection): Promise<FileProperties[]> {
    const shouldRun = this.filter(["StandardValueSet"], (x) => `${x}:`).length > 0;
    if (shouldRun) {
      return listStandardValueSets(conn);
    } else {
      return [];
    }
  }
}
