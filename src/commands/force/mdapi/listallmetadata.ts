import { flags, SfdxCommand } from '@salesforce/command';
import { promises as fs } from 'fs';
import {
  formatFileProperties,
  parseCommaSeparatedValues,
  parseNewLineSeparatedValues
} from '../../../cli';
import * as filters from '../../../filters';
import { listAllMetadata } from '../../../listallmetadata';
import { ensureMetadataComponentPattern } from '../../../metadata-component';
import getStdin = require('get-stdin');

export default class MdapiListAllMetadataCommand extends SfdxCommand {
  public static description = `list all metadata components
    Compared to sfdx force:mdapi:listmetadata this command lists metadata components of all types.
    Additionally you can list metadata components for:
      - folder-based metadata types (Dashboard, Document, EmailTemplate, Report)
      - StandardValueSets (due to a bug)
      - child metadata types (CustomField,CustomLabel,...)`;
  public static examples = [
    `output file properties
    $ sfdx <%= command.id %>
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
    $ sfdx <%= command.id %> -f /tmp/fileproperties.json
`,
    `output sorted metadata component names (format: <type:fullName>)
    $ sfdx <%= command.id %> --names
    ...
    CustomApplication:standard__Sales
    CustomObject:Account
    Layout:Account-Account %28Sales%29 Layout
    Profile:Admin
    Report:unfiled$public/flow_screen_prebuilt_report
    ReportFolder:unfiled$public
    ...
`
  ];

  protected static requiresUsername = true;

  protected static flagsConfig = {
    resultfile: flags.filepath({
      char: 'f',
      description: 'path to the file where results are stored'
    }),
    regular: flags.boolean({
      description: `list regular metadata components (e.g. 'CustomObject')`,
      default: true,
      allowNo: true
    }),
    folderbased: flags.boolean({
      description: `list folders and in-folder metadata components (e.g. 'Report', ReportFolder')`,
      default: true,
      allowNo: true
    }),
    standardvaluesets: flags.boolean({
      description: `workaround to list StandardValueSets which are not returned when running 'sfdx force:mdapi:listmetadata -m StandardValueSet'`,
      default: true,
      allowNo: true
    }),
    children: flags.boolean({
      description: `list metadata components of child types (e.g. 'CustomField' children of 'CustomObject')`
    }),
    metadata: flags.string({
      char: 'm',
      description: `comma-separated list of metadata component name expressions to list
      Example: 'CustomObject:*,CustomField:Account.*'`
    }),
    ignore: flags.string({
      char: 'i',
      description: `comma-separated list of metadata component name expressions to ignore
      Example: 'InstalledPackage:*,Profile:*,Report:unfiled$public/*,CustomField:Account.*'`
    }),
    unlocked: flags.boolean({
      description: `list metadata components from Unlocked Packages`,
      default: null,
      allowNo: true
    }),
    managed: flags.boolean({
      description: `list metadata components from Managed Packages`,
      default: null,
      allowNo: true
    }),
    managedreadonly: flags.boolean({
      description: `list metadata components from Managed Packages that are readonly`,
      default: null,
      allowNo: true
    }),
    managedwriteable: flags.boolean({
      description: `list metadata components from Managed Packages that are writeable`,
      default: null,
      allowNo: true
    }),
    managedmostlysubscribereditable: flags.boolean({
      description: `list metadata components from Managed Packages that are mostly subscriber editable`,
      default: null,
      allowNo: true
    }),
    unmanaged: flags.boolean({
      description: `list metadata components which are not packaged`,
      default: null,
      allowNo: true
    }),
    manageddeprecated: flags.boolean({
      description: `list metadata components which are managed but deprecated`,
      default: null,
      allowNo: true
    }),
    unlockeddeprecated: flags.boolean({
      description: `list metadata components from Unlocked Packages that are deprecated`,
      default: null,
      allowNo: true
    }),
    deprecated: flags.boolean({
      description: `list metadata components that are deprecated`,
      default: null,
      allowNo: true
    }),
    standard: flags.boolean({
      description: `list metadata components like standard objects, settings,...`,
      default: null,
      allowNo: true
    }),
    names: flags.boolean({
      description: `output only component names (e.g. 'CustomObject:Account',...)`
    }),
    output: flags.string({
      description: 'the output format',
      default: 'json',
      options: ['json', 'name', 'name-csv', 'xmlpath', 'xmlpath-csv']
    })
  };

  public async run(): Promise<any> {
    const conn = this.org.getConnection();
    let allowPatterns =
      this.flags.metadata === '-'
        ? parseNewLineSeparatedValues(await getStdin())
        : parseCommaSeparatedValues(this.flags.metadata);
    allowPatterns = allowPatterns.length ? allowPatterns : ['*:*', '*:**/*'];
    allowPatterns = allowPatterns.map(ensureMetadataComponentPattern);
    const ignorePatterns = parseCommaSeparatedValues(this.flags.ignore);
    const allowFunctions = [];
    const ignoreFunctions = [];
    const flag2FunctionName = {
      unlocked: 'isUnlocked',
      managed: 'isManaged',
      managedreadonly: 'isManagedReadOnly',
      unmanaged: 'isUnmanaged',
      managedwriteable: 'isManagedWriteable',
      managedmostlysubscribereditable: 'isManagedMostlySubscriberEditable',
      manageddeprecated: 'isManagedDeprecated',
      unlockeddeprecated: 'isUnlockedDeprecated',
      deprecated: 'isDeprecated',
      standard: 'isStandard'
    };
    for (const filterFlag of Object.keys(flag2FunctionName)) {
      const functionName = flag2FunctionName[filterFlag];
      if (this.flags[filterFlag] !== null) {
        if (this.flags[filterFlag]) {
          allowFunctions.push(filters[functionName]);
        } else {
          ignoreFunctions.push(filters[functionName]);
        }
      }
    }
    let fileProperties = await listAllMetadata(
      conn,
      this.flags,
      allowPatterns,
      ignorePatterns
    );
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
    if (this.flags.names) {
      // backwards compatibility
      this.flags.output = 'name';
    }
    if (this.flags.output === 'json') {
      if (this.flags.resultfile) {
        const fileData: string = JSON.stringify(fileProperties, null, 4);
        await fs.writeFile(this.flags.resultfile, fileData);
      } else {
        this.ux.logJson(fileProperties);
      }
    } else {
      const output = formatFileProperties(fileProperties, this.flags.output);
      if (this.flags.resultfile) {
        await fs.writeFile(this.flags.resultfile, output);
      } else {
        this.ux.log(output);
      }
    }
    return fileProperties;
  }
}
