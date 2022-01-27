const SEPARATOR = ':';

/**
 * simplified FileProperties with only type and fullName
 */
export default interface MetadataComponent {
  type: string;
  fullName: string;
}

/**
 * @param metadataComponentName colon-separated type and fullName (e.g. `CustomField:Account.Industry`)
 */
export function parseMetadataComponentName(
  metadataComponentName: string
): MetadataComponent {
  const [type, fullName, _] = metadataComponentName.split(SEPARATOR);
  if (!type || !fullName || _) {
    throw new Error(
      `Invalid syntax of metadata component name: ${metadataComponentName}
      Expected colon-separated type and fullName (e.g. 'CustomField:Account.Industry')`
    );
  }
  const metadataComponent = {
    type,
    fullName
  };
  return validateMetadataComponent(metadataComponent);
}

/**
 * @returns colon-separated type and fullName (e.g. `CustomField:Account.Industry`)
 */
export function toMetadataComponentName(
  metadataComponent: MetadataComponent
): string {
  validateMetadataComponent(metadataComponent);
  return `${metadataComponent.type}${SEPARATOR}${metadataComponent.fullName}`;
}

export function validateMetadataComponent(
  metadataComponent: MetadataComponent
): MetadataComponent {
  if (
    !metadataComponent.type ||
    !metadataComponent.fullName ||
    typeof metadataComponent.type !== 'string' ||
    typeof metadataComponent.fullName !== 'string'
  ) {
    throw new Error(
      `${JSON.stringify(metadataComponent)} is not a valid MetadataComponent`
    );
  }
  return metadataComponent;
}

export function ensureMetadataComponentPattern(input: string): string {
  if (!input.includes(':')) {
    return `${input}:*`;
  }
  return input;
}

export function simplifyMetadataComponentPattern(input: string): string {
  const metadataComponent = parseMetadataComponentName(input);
  if (/^[*./]+$/.test(metadataComponent.fullName)) {
    return metadataComponent.type;
  }
  return input;
}
