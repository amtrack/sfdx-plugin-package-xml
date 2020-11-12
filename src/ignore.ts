import * as picomatch from 'picomatch';

interface ToStringFunction {
  (item: any): string;
}

/**
 *
 * @param collection an array of strings or objects
 * @param ignorePatterns a list of ignore patterns similar to .gitignore entries
 * @param toString if the collection is an array of objects: a function to convert an item of the collection to a string to be able to match against the ignorePatterns
 * @param picoMatchOptions options for picomatch library
 */
export function ignoreMatching(
  collection: Array<any>,
  ignorePatterns: Array<string>,
  toString?: ToStringFunction,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  picoMatchOptions?: any
): Array<any> {
  const ignore = [];
  const keep = collection.filter((item) => {
    const str = toString ? toString(item) : item;
    const isMatch = picomatch.isMatch(str, ignorePatterns, picoMatchOptions);
    if (isMatch) {
      ignore.push(item);
    }
    return !isMatch;
  });
  return [keep, ignore];
}
