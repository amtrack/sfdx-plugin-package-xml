export function parseCommaSeparatedValues(
  commaSeparatedMetadataComponentNames: string
): Array<string> {
  if (!commaSeparatedMetadataComponentNames) {
    return [];
  }
  return clean(commaSeparatedMetadataComponentNames.split(','));
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
