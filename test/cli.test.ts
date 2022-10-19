import { expect } from "chai";
import { join } from "path";
import {
  getNonEmptyLinesFromFiles,
  parseCommaSeparatedValues,
  parseNewLineSeparatedValues,
} from "../src/cli";

describe("cli", () => {
  describe("parseCommaSeparatedValues()", () => {
    it("parses comma-separated values", () => {
      expect(
        parseCommaSeparatedValues(" CustomObject:Account , ApexPage:Foo")
      ).to.deep.equal(["CustomObject:Account", "ApexPage:Foo"]);
    });
  });
  describe("parseNewLineSeparatedValues()", () => {
    it("parses newline-separated values", () => {
      const input = `CustomObject:Account
      ApexPage:Foo
      `;
      expect(parseNewLineSeparatedValues(input)).to.deep.equal([
        "CustomObject:Account",
        "ApexPage:Foo",
      ]);
    });
  });
  describe("getNonEmptyLinesFromFiles()", () => {
    it("parses multiple files", async () => {
      const fixtures = join("test", "fixtures", "ignore-files");
      const ignoreFiles = [
        join(fixtures, "full.txt"),
        join(fixtures, "empty.txt"),
        join(fixtures, "min.txt"),
      ];
      expect(await getNonEmptyLinesFromFiles(ignoreFiles)).to.deep.equal([
        "ApexClass:Full",
        "ApexPage:Full",
        "ApexClass:Min",
        "ApexPage:Min",
      ]);
    });
  });
});
