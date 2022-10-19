import { readFile } from "fs/promises";
import type { FileProperties } from "jsforce/api/metadata";
import { toMetadataComponentName } from "./metadata-component";

export function parseCommaSeparatedValues(
  commaSeparatedMetadataComponentNames: string
): Array<string> {
  if (!commaSeparatedMetadataComponentNames) {
    return [];
  }
  return clean(commaSeparatedMetadataComponentNames.split(","));
}
export function parseNewLineSeparatedValues(
  newLineSeparatedValues: string
): Array<string> {
  if (!newLineSeparatedValues) {
    return [];
  }
  return clean(newLineSeparatedValues.split(/\r?\n/));
}

function clean(values: Array<string>) {
  return values.map((x) => x.trim()).filter(Boolean);
}

export function formatFileProperties(
  fileProperties: Array<FileProperties>,
  outputType: string
): string {
  let mapFn;
  if (outputType.startsWith("name")) {
    mapFn = toMetadataComponentName;
  } else if (outputType.startsWith("xmlpath")) {
    mapFn = (fp) => fp.fileName;
  }
  const entries = fileProperties.map(mapFn).sort();
  return outputType.endsWith("-csv") ? entries.join(",") : entries.join("\n");
}

export async function getNonEmptyLinesFromFile(
  filePath: string
): Promise<string[]> {
  const content = await readFile(filePath, "utf8");
  return (
    parseNewLineSeparatedValues(content)
      // ignore comments
      .filter((x) => !x.startsWith("#"))
  );
}

export async function getNonEmptyLinesFromFiles(
  filePaths: string[]
): Promise<string[]> {
  const promises = filePaths.map((fp) => getNonEmptyLinesFromFile(fp));
  const results = await Promise.all(promises);
  return results.flat().filter(Boolean);
}
