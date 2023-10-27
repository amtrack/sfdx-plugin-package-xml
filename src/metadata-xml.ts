import { cloneDeep } from "lodash";
import * as xml2js from "xml2js";

export class MetadataXml {
  private _data: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(type: string, data: any) {
    this._data = {};
    this._data[type] = cloneDeep(data);
    this._data[type].$ = {
      xmlns: "http://soap.sforce.com/2006/04/metadata",
    };
  }

  /**
   * @returns formatted XML string
   */
  public toString(): string {
    const builder = new xml2js.Builder({
      xmldec: {
        version: "1.0",
        encoding: "UTF-8",
      },
      explicitRoot: false,
      renderOpts: {
        pretty: true,
        indent: "    ", // 4 spaces
        newline: "\n",
      },
    });
    const xml = builder.buildObject(this._data);
    return xml + "\n";
  }
}
