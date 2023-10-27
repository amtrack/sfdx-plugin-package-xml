import {
  Flags,
  SfCommand,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from "@salesforce/sf-plugins-core";
import { promises as fs } from "fs";
import { parseCommaSeparatedValues, parseNewLineSeparatedValues } from "../../cli";
import { parseMetadataComponentName } from "../../metadata-component";
import { PackageXml } from "../../package-xml";
import getStdin = require("get-stdin");

export class PackageXmlCreateCommand extends SfCommand<any> {
  public static readonly summary = `create a package.xml manifest`;
  public static readonly description = `create a package.xml manifest`;
  public static readonly examples = [
    `create a package.xml manifest based on a list of metadata component names
    $ <%= config.bin %> <%= command.id %> --api-version 50.0 -m "CustomObject:Account,Layout:Account-Account %28Sales%29 Layout"
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
`,
  ];

  public static readonly flags = {
    "target-org": requiredOrgFlagWithDeprecations,
    metadata: Flags.string({
      char: "m",
      summary: "comma-separated list of metadata component names",
      required: true,
    }),
    resultfile: Flags.file({
      char: "f",
      summary: "path to the generated package.xml file",
    }),
    "api-version": orgApiVersionFlagWithDeprecations,
  };

  public async run(): Promise<any> {
    const { flags } = await this.parse(PackageXmlCreateCommand);
    const meta = {};
    if (flags.apiversion) {
      meta["version"] = flags.apiversion;
    }
    const metadataComponentNames =
      flags.metadata === "-"
        ? parseNewLineSeparatedValues(await getStdin())
        : parseCommaSeparatedValues(flags.metadata);
    const packageXml = new PackageXml(metadataComponentNames.map(parseMetadataComponentName), meta).toString();
    if (flags.resultfile) {
      await fs.writeFile(flags.resultfile, packageXml);
    } else {
      this.log(packageXml);
    }
    return;
  }
}
