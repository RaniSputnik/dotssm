import path from "path";
import { local as getConfig } from "./local";

const libDir = __dirname;
const fixturesDir = path.join(__dirname, "../", "tests");
const nestedFixturesDir = path.join(fixturesDir, "nested");
const multipleFixturesDir = path.join(fixturesDir, "multiple-keys");

const validNamespace = "/foo/bar/";
const invalidNamespace = "/invalid/namespace/";
const anyNamespace = "/some/namespace/";

describe("Given there is a .ssm file in the current working directory", () => {
  describe("When getConfig is called with the correct namespace", () => {
    it("Then it returns the local configuration", async () => {
      process.chdir(nestedFixturesDir);
      const result = await getConfig(validNamespace);
      expect(result).toEqual({
        greeting: "Hello, world"
      });
    });
  });

  describe("When getConfig is called with an invalid namespace", () => {
    it("Then it returns an empty object", async () => {
      process.chdir(nestedFixturesDir);
      const result = await getConfig(invalidNamespace);
      expect(result).toEqual(undefined);
    });
  });

  describe("And the .ssm file contains multiple keys", () => {
    describe("When getConfig is called with the correct namespace", () => {
      it("Then it returns all the matching keys", async () => {
        process.chdir(multipleFixturesDir);
        const result = await getConfig("/foo/");
        expect(result).toEqual({
          bar: "baz",
          secret: "localsecret"
        });
      });
    });
  });

  describe("And the config has a nested values", () => {
    describe("When getConfig is called with the correct namespace", () => {
      it("Then it returns nested config as an object", async () => {
        process.chdir(nestedFixturesDir);
        const result = await getConfig("/foo/");
        expect(result).toEqual({
          bar: {
            greeting: "Hello, world"
          }
        });
      });
    });
  });
});

describe("Given there is not an .ssm file present", () => {
  describe("When getConfig is called", () => {
    it("Then it returns an empty object", async () => {
      process.chdir(libDir);
      const result = await getConfig(anyNamespace);
      expect(result).toEqual(undefined);
    });
  });
});
