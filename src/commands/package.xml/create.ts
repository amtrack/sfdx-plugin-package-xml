import { flags, SfdxCommand } from '@salesforce/command';
import { promises as fs } from 'fs';
import {
  parseCommaSeparatedValues,
  parseNewLineSeparatedValues
} from '../../cli';
import { parseMetadataComponentName } from '../../metadata-component';
import PackageXml from '../../package-xml';
import getStdin = require('get-stdin');

export default class PackageXmlCreateCommand extends SfdxCommand {
  public static description = `create a package.xml manifest`;
  public static examples = [
    `create a package.xml manifest based on a list of metadata component names
    $ sfdx <%= command.id %> --apiversion 50.0 -m "CustomObject:Account,Layout:Account-Account %28Sales%29 Layout"
    <?xml version="1.0" encoding="UTF-8"?>
    <Package xmlns="http://soap.sforce.com/2006/04/metadata">
        <types>
            <members>Account</members>
            <name>CustomObject</name>
        </types>
        <types>
            <members>Account-Account %28Sales%29 Layout</members>
            <name>Layout</name>
        </types>
        <version>50.0</version>
    </Package>
`
  ];

  protected static requiresUsername = false;

  protected static flagsConfig = {
    metadata: flags.string({
      char: 'm',
      description: 'comma-separated list of metadata component names',
      required: true
    }),
    resultfile: flags.filepath({
      char: 'f',
      description: 'path to the generated package.xml file'
    }),
    apiversion: flags.builtin()
  };

  public async run(): Promise<any> {
    const meta = {};
    if (this.flags.apiversion) {
      meta['version'] = this.flags.apiversion;
    }
    const metadataComponentNames =
      this.flags.metadata === '-'
        ? parseNewLineSeparatedValues(await getStdin())
        : parseCommaSeparatedValues(this.flags.metadata);
    const packageXml = new PackageXml(
      metadataComponentNames.map(parseMetadataComponentName),
      meta
    ).toString();
    if (this.flags.resultfile) {
      await fs.writeFile(this.flags.resultfile, packageXml);
    } else {
      this.ux.log(packageXml);
    }
    return;
  }
}
