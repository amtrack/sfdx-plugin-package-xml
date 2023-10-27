import { Flags, SfCommand, requiredOrgFlagWithDeprecations } from "@salesforce/sf-plugins-core";
import { promises as fs } from "fs";
import { type FileProperties } from "jsforce/api/metadata";
import {
  formatFileProperties,
  getNonEmptyLinesFromFiles,
  parseCommaSeparatedValues,
  parseNewLineSeparatedValues,
} from "../../../cli";
import * as filters from "../../../filters";
import { listAllMetadata } from "../../../listallmetadata";
import { ensureMetadataComponentPattern } from "../../../metadata-component";
import getStdin = require("get-stdin");

export class MdapiListAllMetadataCommand extends SfCommand<FileProperties[]> {
  public static readonly summary = `list all metadata components
    Compared to sf force mdapi listmetadata this command lists metadata components of all types.
    Additionally you can list metadata components for:
      - folder-based metadata types (Dashboard, Document, EmailTemplate, Report)
      - StandardValueSets (due to a bug)
      - child metadata types (CustomField,CustomLabel,...)`;
  public static readonly description = `list all metadata components
    Compared to sf force mdapi listmetadata this command lists metadata components of all types.
    Additionally you can list metadata components for:
      - folder-based metadata types (Dashboard, Document, EmailTemplate, Report)
      - StandardValueSets (due to a bug)
      - child metadata types (CustomField,CustomLabel,...)`;
  public static readonly examples = [
    `output file properties
    $ <%= config.bin %> <%= command.id %>
    [
      {
        "createdById": "0051g0000059ne4AAA",
        "createdByName": "Admin acme-dev",
        "createdDate": "1970-01-01T00:00:00.000Z",
        "fileName": "labels/CustomLabels.labels",
        "fullName": "CustomLabels",
        "id": "",
        "lastModifiedById": "0051g0000059ne4AAA",
        "lastModifiedByName": "Admin acme-dev",
        "lastModifiedDate": "1970-01-01T00:00:00.000Z",
        "namespacePrefix": "",
        "type": "CustomLabels"
      },
      ...
    ]
`,
    `write file properties to a file
    $ <%= config.bin %> <%= command.id %> -f /tmp/fileproperties.json
`,
    `output sorted metadata component names (format: <type:fullName>)
    $ <%= config.bin %> <%= command.id %> --names
    ...
    CustomApplication:standard__Sales
    CustomObject:Account
    Layout:Account-Account %28Sales%29 Layout
    Profile:Admin
    Report:unfiled$public/flow_screen_prebuilt_report
    ReportFolder:unfiled$public
    ...
`,
  ];

  public static readonly flags = {
    "target-org": requiredOrgFlagWithDeprecations,
    resultfile: Flags.file({
      char: "f",
      summary: "path to the file where results are stored",
    }),
    regular: Flags.boolean({
      summary: `list regular metadata components (e.g. 'CustomObject')`,
      default: true,
      allowNo: true,
    }),
    folderbased: Flags.boolean({
      summary: `list folders and in-folder metadata components (e.g. 'Report', ReportFolder')`,
      default: true,
      allowNo: true,
    }),
    standardvaluesets: Flags.boolean({
      summary: `workaround to list StandardValueSets which are not returned when running 'sf force mdapi listmetadata -m StandardValueSet'`,
      default: true,
      allowNo: true,
    }),
    children: Flags.boolean({
      summary: `list metadata components of child types (e.g. 'CustomField' children of 'CustomObject')`,
    }),
    metadata: Flags.string({
      char: "m",
      summary: `comma-separated list of metadata component name expressions to list
      Example: 'CustomObject:*,CustomField:Account.*'`,
    }),
    ignore: Flags.string({
      char: "i",
      summary: `comma-separated list of metadata component name expressions to ignore
      Example: 'InstalledPackage:*,Profile:*,Report:unfiled$public/*,CustomField:Account.*'`,
    }),
    ignorefile: Flags.file({
      summary: `same as --ignore, but instead read from a file containing one ignore pattern per line`,
      multiple: true,
    }),
    unlocked: Flags.boolean({
      summary: `list metadata components from Unlocked Packages`,
      default: undefined,
      allowNo: true,
    }),
    managed: Flags.boolean({
      summary: `list metadata components from Managed Packages`,
      default: undefined,
      allowNo: true,
    }),
    managedreadonly: Flags.boolean({
      summary: `list metadata components from Managed Packages that are readonly`,
      default: undefined,
      allowNo: true,
    }),
    managedwriteable: Flags.boolean({
      summary: `list metadata components from Managed Packages that are writeable`,
      default: undefined,
      allowNo: true,
    }),
    unmanaged: Flags.boolean({
      summary: `list metadata components which are not packaged`,
      default: undefined,
      allowNo: true,
    }),
    manageddeprecated: Flags.boolean({
      summary: `list metadata components which are managed but deprecated`,
      default: undefined,
      allowNo: true,
    }),
    unlockeddeprecated: Flags.boolean({
      summary: `list metadata components from Unlocked Packages that are deprecated`,
      default: undefined,
      allowNo: true,
    }),
    deprecated: Flags.boolean({
      summary: `list metadata components that are deprecated`,
      default: undefined,
      allowNo: true,
    }),
    standard: Flags.boolean({
      summary: `list metadata components like standard objects, settings,...`,
      default: undefined,
      allowNo: true,
    }),
    names: Flags.boolean({
      summary: `output only component names (e.g. 'CustomObject:Account',...)`,
    }),
    output: Flags.string({
      summary: "the output format",
      default: "json",
      options: ["json", "name", "name-csv", "xmlpath", "xmlpath-csv"],
    }),
  };

  public async run(): Promise<FileProperties[]> {
    const { flags } = await this.parse(MdapiListAllMetadataCommand);
    const conn = flags["target-org"].getConnection();
    let allowPatterns =
      flags.metadata === "-"
        ? parseNewLineSeparatedValues(await getStdin())
        : parseCommaSeparatedValues(flags.metadata);
    allowPatterns = allowPatterns.length ? allowPatterns : ["*:*", "*:**/*"];
    allowPatterns = allowPatterns.map(ensureMetadataComponentPattern);
    const ignorePatterns = [
      ...(await getNonEmptyLinesFromFiles(flags.ignorefile)),
      ...parseCommaSeparatedValues(flags.ignore),
    ];
    const allowFunctions: Function[] = [];
    const ignoreFunctions: Function[] = [];
    const flag2FunctionName = {
      unlocked: "isUnlocked",
      managed: "isManaged",
      managedreadonly: "isManagedReadOnly",
      unmanaged: "isUnmanaged",
      managedwriteable: "isManagedWriteable",
      manageddeprecated: "isManagedDeprecated",
      unlockeddeprecated: "isUnlockedDeprecated",
      deprecated: "isDeprecated",
      standard: "isStandard",
    };
    for (const filterFlag of Object.keys(flag2FunctionName)) {
      const functionName = flag2FunctionName[filterFlag];
      if (flags[filterFlag] !== undefined) {
        if (flags[filterFlag]) {
          allowFunctions.push(filters[functionName]);
        } else {
          ignoreFunctions.push(filters[functionName]);
        }
      }
    }
    if (flags.children) {
      // omit parent types which don't have own properties
      ignoreFunctions.push(filters.isPureContainerType);
    }
    const enabledListerIds = ["children", "folderbased", "regular", "standardvaluesets"].filter(
      (flagName) => flags[flagName],
    );
    let fileProperties = await listAllMetadata(conn, enabledListerIds, allowPatterns, ignorePatterns);
    if (allowFunctions.length > 0) {
      fileProperties = fileProperties.filter((fp) => {
        const results = allowFunctions.map((f) => f(fp));
        return results.some((x) => x === true);
      });
    }
    if (ignoreFunctions.length > 0) {
      fileProperties = fileProperties.filter((fp) => {
        const results = ignoreFunctions.map((f) => f(fp));
        return !results.some((x) => x === true);
      });
    }
    if (flags.names) {
      // backwards compatibility
      flags.output = "name";
    }
    if (flags.output === "json") {
      if (flags.resultfile) {
        const fileData: string = JSON.stringify(fileProperties, null, 4);
        await fs.writeFile(flags.resultfile, fileData);
      } else {
        this.styledJSON(fileProperties);
      }
    } else {
      const output = formatFileProperties(fileProperties, flags.output);
      if (flags.resultfile) {
        await fs.writeFile(flags.resultfile, output);
      } else {
        this.log(output);
      }
    }
    return fileProperties;
  }
}
