import { flags, SfdxCommand } from '@salesforce/command';
import { promises as fs } from 'fs';
import {
  getNonEmptyLinesFromFiles,
  parseCommaSeparatedValues
} from '../../cli';
import { match } from '../../match';
import { toMetadataComponentName } from '../../metadata-component';
import PackageXml from '../../package-xml';

export default class PackageXmlGenerateCommand extends SfdxCommand {
  public static description = `generate a package.xml manifest based on the force:mdapi:listallmetadata output`;
  public static examples = [
    `generate and output a package.xml manifest based on the force:mdapi:listallmetadata result
    $ sfdx <%= command.id %> --inputfile /tmp/fileproperties.json
    <?xml version="1.0" encoding="UTF-8"?>
    <Package xmlns="http://soap.sforce.com/2006/04/metadata">
        <types>
            <members>standard__Sales</members>
            <name>CustomApplication</name>
        </types>
        <types>
            <members>Account</members>
            <name>CustomObject</name>
        </types>
        <types>
            <members>Account-Account %28Sales%29 Layout</members>
            <name>Layout</name>
        </types>
        <types>
            <members>Admin</members>
            <name>Profile</name>
        </types>
        <types>
            <members>unfiled$public/flow_screen_prebuilt_report</members>
            <name>Report</name>
        </types>
        <types>
            <members>unfiled$public</members>
            <name>ReportFolder</name>
        </types>
        <version>50.0</version>
    </Package>
`
  ];

  protected static requiresUsername = false;

  protected static flagsConfig = {
    inputfile: flags.filepath({
      char: 'j',
      description: 'path to a file with fileproperties in JSON Array format',
      required: true
    }),
    resultfile: flags.filepath({
      char: 'f',
      description: 'path to the generated package.xml file'
    }),
    ignore: flags.string({
      char: 'i',
      description: `comma-separated list of metadata component name expressions to ignore
      Example: 'InstalledPackage:*,Profile:*,Report:unfiled$public/*,CustomField:Account.*'`
    }),
    ignorefile: flags.filepath({
      description: `same as --ignore, but instead read from a file containing one ignore pattern per line`,
      multiple: true
    }),
    defaultignore: flags.array({
      description: 'ignored by default, to disable use --defaultignore ""',
      default: ['InstalledPackage:*']
    }),
    apiversion: flags.builtin()
  };

  public async run(): Promise<any> {
    let fileProperties;
    try {
      const buf = await fs.readFile(this.flags.inputfile);
      fileProperties = JSON.parse(buf.toString());
    } catch (e) {
      throw new Error(
        `Could not parse inputfile at path ${this.flags.inputfile}`
      );
    }
    const meta = {};
    if (this.flags.apiversion) {
      meta['version'] = this.flags.apiversion;
    }
    const ignorePatterns = [
      ...(await getNonEmptyLinesFromFiles(this.flags.ignorefile)),
      ...parseCommaSeparatedValues(this.flags.ignore),
      ...this.flags.defaultignore
    ];
    const [, keep] = match(
      fileProperties,
      ignorePatterns,
      toMetadataComponentName
    );
    const packageXml = new PackageXml(keep, meta).toString();
    if (this.flags.resultfile) {
      await fs.writeFile(this.flags.resultfile, packageXml);
    } else {
      this.ux.log(packageXml);
    }
    return;
  }
}
