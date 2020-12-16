import { flags, SfdxCommand } from '@salesforce/command';
import { promises as fs } from 'fs';
import {
  parseCommaSeparatedValues,
  parseNewLineSeparatedValues
} from '../../../cli';
import { listAllMetadata } from '../../../listallmetadata';
import getStdin = require('get-stdin');

export default class MdapiListAllMetadataCommand extends SfdxCommand {
  public static description = `list all metadata components
    Compared to sfdx force:mdapi:listmetadata this command lists metadata components of all types and in all folders by default.
    Additionally you can choose to include retrieving metadata components of child metadata types.`;
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
      description: `list StandardValueSets`,
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
    names: flags.boolean({
      description: `output only component names (e.g. 'CustomObject:Account',...)`
    })
  };

  public async run(): Promise<any> {
    const conn = this.org.getConnection();
    let allowPatterns =
      this.flags.metadata === '-'
        ? parseNewLineSeparatedValues(await getStdin())
        : parseCommaSeparatedValues(this.flags.metadata);
    allowPatterns = allowPatterns.length ? allowPatterns : ['**/*'];
    const ignorePatterns = parseCommaSeparatedValues(this.flags.ignore);
    const fileProperties = await listAllMetadata(
      conn,
      this.flags,
      allowPatterns,
      ignorePatterns
    );
    if (this.flags.resultfile) {
      const fileData: string = JSON.stringify(fileProperties, null, 4);
      await fs.writeFile(this.flags.resultfile, fileData);
    } else if (this.flags.names) {
      const componentNames = fileProperties.map((fileProperty) => {
        return `${fileProperty.type}:${fileProperty.fullName}`;
      });
      this.ux.log(componentNames.sort().join('\n'));
    } else {
      this.ux.logJson(fileProperties);
    }
    return fileProperties;
  }
}
