import { expect } from "chai";
import * as fs from "fs";
import { omit } from "lodash";
import * as path from "path";
import MetadataXml from "../src/metadata-xml";

describe("MetadataXml", () => {
  const AccountObject = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "fixtures", "CustomObject:Account.json"),
      "utf8"
    )
  );
  const AccountLayout = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "fixtures", "Layout:Account-Account Layout.json"),
      "utf8"
    )
  );
  describe("#toString()", () => {
    it("should return the xml representation of a metadata file", () => {
      const fixture = fs
        .readFileSync(
          path.resolve(
            __dirname,
            "fixtures",
            "mdapi",
            "layouts",
            "Account-Account Layout.layout"
          )
        )
        .toString();
      const metadata = new MetadataXml(
        "Layout",
        omit(AccountLayout, "fullName")
      );
      expect(metadata.toString()).to.deep.equal(fixture);
    });
    it("should return the xml representation of a metadata file with special characters", () => {
      const fixture = fs
        .readFileSync(
          path.resolve(
            __dirname,
            "fixtures",
            "mdapi",
            "objects",
            "Account.object"
          )
        )
        .toString();
      const metadata = new MetadataXml(
        "CustomObject",
        omit(AccountObject, "fullName", "label")
      );
      expect(metadata.toString()).to.deep.equal(fixture);
    });
  });
});
