import { expect } from "chai";
import { match } from "../src/match";

describe("match", () => {
  describe("match()", () => {
    it("matches using a single pattern", () => {
      expect(match(["InstalledPackage:Foo", "CustomObject:Account"], ["InstalledPackage:*"])).to.deep.equal([
        ["InstalledPackage:Foo"],
        ["CustomObject:Account"],
      ]);
    });
    it("matches using multiple patterns", () => {
      expect(
        match(["InstalledPackage:Foo", "CustomObject:Account"], ["InstalledPackage:*", "CustomObject:*"]),
      ).to.deep.equal([["InstalledPackage:Foo", "CustomObject:Account"], []]);
    });
    it("matches both folders and files in folders with a wildcard", () => {
      expect(match(["foo", "foo/bar", "foo/bar/baz"], ["**"])).to.deep.equal([["foo", "foo/bar", "foo/bar/baz"], []]);
    });
    it("unfortunately does not match both folders and files in folders with a dedicated expression", () => {
      expect(match(["foo", "foo/bar", "foo/bar/baz"], ["foo/**/*"])).to.deep.equal([
        ["foo/bar", "foo/bar/baz"],
        ["foo"],
      ]);
    });
    it("matches everything but InstalledPackages", () => {
      expect(match(["InstalledPackage:Foo", "CustomObject:Account"], ["!(InstalledPackage:*)"])).to.deep.equal([
        ["CustomObject:Account"],
        ["InstalledPackage:Foo"],
      ]);
    });
    it("matches everything but InstalledPackages and not Bar", () => {
      expect(
        match(
          ["InstalledPackage:Foo", "InstalledPackage:Bar", "CustomObject:Account"],
          ["!(InstalledPackage:*)", "InstalledPackage:Bar"],
        ),
      ).to.deep.equal([["InstalledPackage:Bar", "CustomObject:Account"], ["InstalledPackage:Foo"]]);
    });
    it("matches using default allow pattern", () => {
      expect(
        match(["CustomObject:Account", "EmailTemplate:unfiled$public/Dummy"], ["*:*", "*:**/*"], (x) => x),
      ).to.deep.equal([["CustomObject:Account", "EmailTemplate:unfiled$public/Dummy"], []]);
    });
    it("matches using ignore list", () => {
      expect(
        match(
          [
            "InstalledPackage:Foo",
            "InstalledPackage:Bar",
            "CustomObject:Account",
            "EmailTemplate:unfiled$public/Dummy",
          ],
          ["**/*"],
          (x) => x,
          { ignore: ["InstalledPackage:Foo"] },
        ),
      ).to.deep.equal([
        ["InstalledPackage:Bar", "CustomObject:Account", "EmailTemplate:unfiled$public/Dummy"],
        ["InstalledPackage:Foo"],
      ]);
    });
    it("matches using a collection with a toString function", () => {
      expect(
        match(
          [
            { type: "InstalledPackage", fullName: "Foo" },
            { type: "CustomObject", fullName: "Account" },
          ],
          ["InstalledPackage:*"],
          (x) => `${x.type}:${x.fullName}`,
        ),
      ).to.deep.equal([
        [{ type: "InstalledPackage", fullName: "Foo" }],
        [{ type: "CustomObject", fullName: "Account" }],
      ]);
    });
  });
});
