import type { FileProperties, ListMetadataQuery } from "@jsforce/jsforce-node/lib/api/metadata.js";
import type { Connection } from "@salesforce/core";

/**
 * workaround as the Metadata API (converted from XML) returns an object instead of an array of length 1
 * @param prop result of a Metadata API call (array or object)
 */
export function ensureArray(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  prop: any,
): any[] {
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
export async function listMetadataInChunks(conn: Connection, queries: ListMetadataQuery[]): Promise<FileProperties[]> {
  const CHUNK_SIZE = 3;
  const result: FileProperties[] = [];
  for (const chunkOfQueries of chunk(queries, CHUNK_SIZE)) {
    try {
      const chunkOfMetadataComponents = await conn.metadata.list(chunkOfQueries);
      if (chunkOfMetadataComponents) {
        result.push(...ensureArray(chunkOfMetadataComponents));
      }
    } catch (_) {
      // fall back to 1 query to identify root cause
      for (const query of chunkOfQueries) {
        try {
          const metadataComponents = await conn.metadata.list(query);
          result.push(...ensureArray(metadataComponents));
        } catch (e) {
          throw new Error(
            `Failed to list metadata components for ${query.type}${query.folder ? `:${query.folder}` : ""}: ${
              e.message
            }`,
          );
        }
      }
    }
  }
  return result;
}

const chunk = (input, size) => {
  return input.reduce((arr, item, idx) => {
    return idx % size === 0
      ? [...arr, [item]]
      : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
};
