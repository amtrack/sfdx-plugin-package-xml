import type { Connection } from "@salesforce/core";
import type { FileProperties, ListMetadataQuery } from "jsforce/api/metadata";

import { chunk } from "lodash";

/**
 * workaround as the Metadata API (converted from XML) returns an object instead of an array of length 1
 * @param prop result of a Metadata API call (array or object)
 */
export function ensureArray(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  prop: any
): Array<any> {
  if (Array.isArray(prop)) {
    return prop;
  }
  if (prop === undefined || prop === null) {
    return [];
  }
  return [prop];
}

/**
 * workaround for LIMIT_EXCEEDED: No more than 3 allowed in request
 * @param conn jsforce Connection
 * @param queries list of queries
 */
export async function listMetadataInChunks(
  conn: Connection,
  queries: Array<ListMetadataQuery>
): Promise<Array<FileProperties>> {
  const CHUNK_SIZE = 3;
  const result = [];
  for (const chunkOfQueries of chunk(queries, CHUNK_SIZE)) {
    const chunkOfMetadataComponents = await conn.metadata.list(chunkOfQueries);
    if (chunkOfMetadataComponents) {
      result.push(...ensureArray(chunkOfMetadataComponents));
    }
  }
  return result;
}
