import { fromPairs, groupBy } from 'lodash';
import MetadataComponent, {
  validateMetadataComponent
} from './metadata-component';
import { transformFolderToType } from './metadata-folder';
import MetadataXml from './metadata-xml';

/**
 * Attempt to match the formatting of the package.xml manifest
 * for better compatibility with version control systems
 */
export default class PackageXml {
  private components: Array<MetadataComponent>;
  private meta: Record<string, string>;

  /**
   *
   * @param components
   * @param meta additional properties like `version` and for managed packages `description`, `fullName`, `namespacePrefix`, `postInstallClass`
   */
  constructor(
    components: Array<MetadataComponent>,
    meta?: Record<string, string>
  ) {
    this.components = components.map(validateMetadataComponent);
    this.meta = meta;
  }

  // <types> are sorted alphanumerically but Settings are placed at the end
  // within <types> the properties are sorted alphanumerically (<name> after <members>)
  public toJSON(): any {
    const components = transformFolders(this.components);
    const groupedComponents = groupBy(components, 'type');
    const types = Object.entries(groupedComponents)
      .map((entry) => {
        const [type, components] = entry;
        return {
          members: components
            .map((component) => component.fullName)
            .sort(compareAlphanumeric),
          name: type
        };
      })
      .sort((a, b) => {
        return compareMetadataTypeNames(a.name, b.name);
      });
    const result = Object.assign({}, this.meta, { types });
    // in ES2019: Object.fromEntries
    return fromPairs(
      Object.entries(result).sort((a, b) =>
        comparePackageXmlProperties(a[0], b[0])
      )
    );
  }

  /**
   * @returns formatted XML string
   */
  public toString(): string {
    const writer = new MetadataXml('Package', this.toJSON());
    return writer.toString();
  }
}

export function compareAlphanumeric(a: string, b: string): number {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

/**
 * always place Settings at the end, otherwise alphanumeric
 **/
export function compareMetadataTypeNames(a: string, b: string): number {
  if (a === 'Settings' && b !== 'Settings') {
    return 1;
  }
  if (a !== 'Settings' && b === 'Settings') {
    return -1;
  }
  return compareAlphanumeric(a, b);
}

/**
 * fullName first, version at the end, otherwise alphanumeric
 **/
export function comparePackageXmlProperties(a: string, b: string): number {
  if (a === 'fullName' && b !== 'fullName') {
    return -1;
  }
  if (a !== 'version' && b === 'version') {
    return -1;
  }
  if (a !== 'fullName' && b === 'fullName') {
    return 1;
  }
  if (a === 'version' && b !== 'version') {
    return 1;
  }
  return compareAlphanumeric(a, b);
}

/**
 * list folders with the type of their content
 *
 * see Declarative Metadata Sample Definition at https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_folder.htm
 */
export function transformFolders(
  components: Array<MetadataComponent>
): Array<MetadataComponent> {
  return components.map((c) => {
    c.type = transformFolderToType(c.type);
    return c;
  });
}
