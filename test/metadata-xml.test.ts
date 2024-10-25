import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import { MetadataXml } from "../src/metadata-xml.js";

describe("MetadataXml", () => {
  const AccountObject = JSON.parse(
    fs.readFileSync(path.join("test", "fixtures", "CustomObject:Account.json"), "utf8"),
  );
  const AccountLayout = JSON.parse(
    fs.readFileSync(path.join("test", "fixtures", "Layout:Account-Account Layout.json"), "utf8"),
  );
  describe("#toString()", () => {
    it("should return the xml representation of a metadata file", () => {
      const fixture = fs
        .readFileSync(path.resolve("test", "fixtures", "mdapi", "layouts", "Account-Account Layout.layout"))
        .toString();
      const {fullName, ...layout} = AccountLayout;
      const metadata = new MetadataXml("Layout", layout);
      expect(metadata.toString()).to.deep.equal(fixture);
    });
    it("should return the xml representation of a metadata file with special characters", () => {
      const fixture = fs
        .readFileSync(path.resolve("test", "fixtures", "mdapi", "objects", "Account.object"))
        .toString();
      const {fullName, label, ...customObject} = AccountObject;
      const metadata = new MetadataXml("CustomObject", customObject);
      expect(metadata.toString()).to.deep.equal(fixture);
    });
  });
});
