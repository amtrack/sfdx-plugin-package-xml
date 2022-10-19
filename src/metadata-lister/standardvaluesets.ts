import { listStandardValueSets } from "@mdapi-issues/listmetadata-standardvalueset";
import type { Connection } from "@salesforce/core";
import type {
  FileProperties
} from "jsforce/api/metadata";
import MetadataLister from "../metadata-lister";

export default class StandardValueSetLister extends MetadataLister {
  public static id = "standardvaluesets";
  public async run(
    conn: Connection,
  ): Promise<Array<FileProperties>> {
    const shouldRun =
      this.filter(["StandardValueSet"], (x) => `${x}:`).length > 0;
    if (shouldRun) {
      return await listStandardValueSets(conn);
    } else {
      return [];
    }
  }
}
