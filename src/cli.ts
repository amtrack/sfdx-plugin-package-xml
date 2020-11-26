import getStdin = require('get-stdin');
import MetadataComponent, {
  parseMetadataComponentName
} from './metadata-component';

export async function getMetadataComponentsFromStdinOrString(
  commaSeparatedMetadataComponentNames: string
): Promise<Array<MetadataComponent>> {
  let rawComponentNames = [];
  if (commaSeparatedMetadataComponentNames === '-') {
    rawComponentNames = (await getStdin()).split('\n');
  } else {
    rawComponentNames = commaSeparatedMetadataComponentNames.split(',');
  }
  return rawComponentNames
    .map((x) => x.trim())
    .filter(Boolean)
    .map(parseMetadataComponentName);
}
