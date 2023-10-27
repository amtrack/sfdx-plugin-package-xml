import { expect } from "chai";
import { ensureArray } from "../src/jsforce-utils";

describe("jsforce-utils", () => {
  describe("ensureArray()", () => {
    it("makes an object an array", () => {
      expect(ensureArray({ foo: "bar" })).to.deep.equal([{ foo: "bar" }]);
    });
    it("leaves an array untouched", () => {
      expect(ensureArray([{ foo: "bar" }])).to.deep.equal([{ foo: "bar" }]);
    });
    it("makes the value false an array", () => {
      expect(ensureArray(false)).to.deep.equal([false]);
    });
    it("makes an emtpy string an array", () => {
      expect(ensureArray("")).to.deep.equal([""]);
    });
    it("makes undefined an empty array", () => {
      expect(ensureArray(undefined)).to.deep.equal([]);
    });
    it("makes null an empty array", () => {
      expect(ensureArray(null)).to.deep.equal([]);
    });
  });
});
