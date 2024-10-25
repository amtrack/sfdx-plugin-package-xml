import picomatch from "picomatch";

export type ToStringFunction = (item: any) => string;

/**
 *
 * @param collection an array of strings or objects
 * @param patterns a list of patterns similar to .gitignore entries
 * @param toString if the collection is an array of objects: a function to convert an item of the collection to a string to be able to match against the allowPatterns
 * @param picoMatchOptions options for picomatch library
 * @returns Array with [matched, unmatched]
 */
export function match(
  collection: any[],
  patterns: string[],
  toString?: ToStringFunction,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  picoMatchOptions?: any,
): any[] {
  const unmatched: any[] = [];
  const matched = collection.filter((item) => {
    const str = toString ? toString(item) : item;
    const isMatch = picomatch.isMatch(str, patterns, picoMatchOptions);
    if (!isMatch) {
      unmatched.push(item);
    }
    return isMatch;
  });
  return [matched, unmatched];
}
