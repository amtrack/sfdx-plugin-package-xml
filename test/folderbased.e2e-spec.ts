import { Org } from "@salesforce/core";
import { expect } from "chai";
import { toMetadataComponentName } from "../src/metadata-component.js";
import { FolderBasedMetadata } from "../src/metadata-lister/folderbased.js";

const expected = [
  "EmailFolder:unfiled$public",
  "EmailTemplate:Bar/Baz_1645201301610",
  "EmailTemplateFolder:Bar",
  "EmailTemplateFolder:Foo",
  "EmailTemplateFolder:unfiled$public",
  "Report:FooReports/FooAccountsClassicReport",
  "Report:FooReports/FooAccountsLightningReport_vgv",
  "Report:FooSubReports/FooAccountsSubLightningReport_kgv",
  "ReportFolder:FooReports",
  "ReportFolder:FooSubReports",
  "ReportFolder:unfiled$public",
];

describe("folderbased", function () {
  this.slow("30s");
  this.timeout("2m");
  describe("listFolderBasedMetadata()", () => {
    it("lists folders and files in folders", async () => {
      const org = await Org.create({});
      const conn = org.getConnection();
      const lister = new FolderBasedMetadata(["*:*", "*:**/*"], []);
      const result = await lister.run(conn);
      const names = result.map(toMetadataComponentName);
      for (const exp of expected) {
        expect(names).to.include(exp);
      }
    });
    it("lists only unfiled$public folder and files", async () => {
      const org = await Org.create({});
      const conn = org.getConnection();
      const lister = new FolderBasedMetadata(["ReportFolder:unfiled$public", "Report:unfiled$public/*"], []);
      const result = await lister.run(conn);
      const names = result.map(toMetadataComponentName);
      for (const exp of ["Report:unfiled$public/PublicAccountsClassicReport", "ReportFolder:unfiled$public"]) {
        expect(names).to.include(exp);
      }
    });
  });
});
