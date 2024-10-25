import {
  Flags,
  SfCommand,
  orgApiVersionFlagWithDeprecations
} from "@salesforce/sf-plugins-core";
import { promises as fs } from "fs";
import { getNonEmptyLinesFromFiles, parseCommaSeparatedValues } from "../../cli.js";
import { match } from "../../match.js";
import { toMetadataComponentName } from "../../metadata-component.js";
import { PackageXml } from "../../package-xml.js";

export class PackageXmlGenerateCommand extends SfCommand<any> {
  public static readonly summary = `generate a package.xml manifest based on the force:mdapi:listallmetadata output`;
  public static readonly description = `generate a package.xml manifest based on the force:mdapi:listallmetadata output`;
  public static readonly examples = [
    `generate and output a package.xml manifest based on the force:mdapi:listallmetadata result
    $ <%= config.bin %> <%= command.id %> --inputfile /tmp/fileproperties.json
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
`,
  ];

  public static readonly flags = {
    inputfile: Flags.file({
      char: "j",
      summary: "path to a file with fileproperties in JSON Array format",
      required: true,
    }),
    resultfile: Flags.file({
      char: "f",
      summary: "path to the generated package.xml file",
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
    defaultignore: Flags.string({
      summary: 'ignored by default, to disable use --defaultignore ""',
      default: "InstalledPackage:*",
    }),
    "api-version": orgApiVersionFlagWithDeprecations,
  };

  public async run(): Promise<any> {
    const { flags } = await this.parse(PackageXmlGenerateCommand);
    let fileProperties;
    try {
      const buf = await fs.readFile(flags.inputfile);
      fileProperties = JSON.parse(buf.toString());
    } catch (e) {
      throw new Error(`Could not parse inputfile at path ${flags.inputfile}`);
    }
    const meta = {};
    if (flags["api-version"]) {
      meta["version"] = flags["api-version"];
    }
    const ignorePatterns = [
      ...(await getNonEmptyLinesFromFiles(flags.ignorefile)),
      ...parseCommaSeparatedValues(flags.ignore),
      ...parseCommaSeparatedValues(flags.defaultignore),
    ];
    const [, keep] = match(fileProperties, ignorePatterns, toMetadataComponentName);
    const packageXml = new PackageXml(keep, meta).toString();
    if (flags.resultfile) {
      await fs.writeFile(flags.resultfile, packageXml);
    } else {
      this.log(packageXml);
    }
    return;
  }
}
