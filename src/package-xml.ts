import { MetadataComponent, validateMetadataComponent } from "./metadata-component.js";
import { transformFolderToType } from "./metadata-folder.js";
import { MetadataXml } from "./metadata-xml.js";

/**
 * Attempt to match the formatting of the package.xml manifest
 * for better compatibility with version control systems
 */
export class PackageXml {
  private components: MetadataComponent[];
  private meta: Record<string, string> | undefined;

  /**
   *
   * @param components
   * @param meta additional properties like `version` and for managed packages `description`, `fullName`, `namespacePrefix`, `postInstallClass`
   */
  constructor(components: MetadataComponent[], meta?: Record<string, string>) {
    this.components = components.map(validateMetadataComponent);
    this.meta = meta;
  }

  // <types> are sorted alphanumerically but Settings are placed at the end
  // within <types> the properties are sorted alphanumerically (<name> after <members>)
  public toJSON(): any {
    const components = transformFolders(this.components);
    const groupedComponents: Map<string, MetadataComponent[]> = groupByKey(components, "type");
    const types = Object.entries(groupedComponents)
      .map((entry) => {
        const [type, components] = entry;
        return {
          members: components.map((component) => component.fullName).sort(compareAlphanumeric),
          name: type,
        };
      })
      .sort((a, b) => {
        return compareMetadataTypeNames(a.name, b.name);
      });
    const result = Object.assign({}, this.meta, { types });
    return Object.fromEntries(Object.entries(result).sort((a, b) => comparePackageXmlProperties(a[0], b[0])));
  }

  /**
   * @returns formatted XML string
   */
  public toString(): string {
    const writer = new MetadataXml("Package", this.toJSON());
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
  if (a === "Settings" && b !== "Settings") {
    return 1;
  }
  if (a !== "Settings" && b === "Settings") {
    return -1;
  }
  return compareAlphanumeric(a, b);
}

/**
 * fullName first, version at the end, otherwise alphanumeric
 **/
export function comparePackageXmlProperties(a: string, b: string): number {
  if (a === "fullName" && b !== "fullName") {
    return -1;
  }
  if (a !== "version" && b === "version") {
    return -1;
  }
  if (a !== "fullName" && b === "fullName") {
    return 1;
  }
  if (a === "version" && b !== "version") {
    return 1;
  }
  return compareAlphanumeric(a, b);
}

/**
 * list folders with the type of their content
 *
 * see Declarative Metadata Sample Definition at https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_folder.htm
 */
export function transformFolders(components: MetadataComponent[]): MetadataComponent[] {
  return components.map((c) => {
    c.type = transformFolderToType(c.type);
    return c;
  });
}

const groupByKey = (list, key) => list.reduce((hash, obj) => ({...hash, [obj[key]]:( hash[obj[key]] || [] ).concat(obj)}), {})
