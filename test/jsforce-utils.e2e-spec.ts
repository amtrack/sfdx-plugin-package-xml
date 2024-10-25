import { expect } from "chai";
import { listMetadataInChunks } from "../src/jsforce-utils.js";
import { Org } from "@salesforce/core";

describe("jsforce-utils", () => {
  describe("listMetadataInChunks()", () => {
    it("lists more than 4 queries in chunks of 3", async () => {
      const org = await Org.create({});
      const conn = org.getConnection();
      const result = await listMetadataInChunks(conn, [
        { type: "ApexClass" },
        { type: "CustomObject" },
        { type: "ApexPage" },
        { type: "ApexTrigger" },
      ]);
      expect(result).length.to.be.greaterThanOrEqual(1);
    });
    it("retries per query when a chunk of queries failed", async () => {
      const org = await Org.create({});
      const conn = org.getConnection();
      let err;
      try {
        await listMetadataInChunks(conn, [{ type: "ThisTypeDoesNotExist" }]);
      } catch (e) {
        err = e;
      }
      expect(() => {
        throw err;
      }).to.throw(/Failed to list.*ThisTypeDoesNotExist.*INVALID_TYPE.*ThisTypeDoesNotExist/, err.message);
    });
  });
});
