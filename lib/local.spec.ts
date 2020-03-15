import path from "path";
import { local } from "./local";

const getConfig = local();
const libDir = __dirname;
const fixturesDir = path.join(__dirname, "../", "tests");
const customFixturesDir = path.join(fixturesDir, "custom");
const multipleFixturesDir = path.join(fixturesDir, "multiple-keys");
const nestedFixturesDir = path.join(fixturesDir, "nested");

const validNamespace = "/foo/bar";
const unknownNamespace = "/unknown/namespace/";
const anyNamespace = "/some/namespace";

describe("Given there is a .ssm file in the current working directory", () => {
  describe("When getConfig is called with the correct namespace", () => {
    it("Then it returns the local configuration", async () => {
      process.chdir(nestedFixturesDir);
      const result = await getConfig(validNamespace);
      expect(result).toEqual({
        "/greeting": "Hello, world"
      });
    });
  });

  describe("When getConfig is called with an unknown namespace", () => {
    it("Then it returns an empty object", async () => {
      process.chdir(nestedFixturesDir);
      const result = await getConfig(unknownNamespace);
      expect(result).toEqual({});
    });
  });

  describe("When getConfig is called with an invalid namespace", () => {
    it("Then it returns an empty object", async () => {
      process.chdir(nestedFixturesDir);
      const invalidNamespace = validNamespace + "/";
      const result = await getConfig(invalidNamespace);
      expect(result).toEqual({});
    });
  });

  describe("And the .ssm file contains multiple keys", () => {
    describe("When getConfig is called with the correct namespace", () => {
      it("Then it returns all the matching keys", async () => {
        process.chdir(multipleFixturesDir);
        const result = await getConfig("/foo");
        expect(result).toEqual({
          "/bar": "baz",
          "/secret": "localsecret"
        });
      });
    });
  });

  describe("And the config has a nested values", () => {
    describe("When getConfig is called with the correct namespace", () => {
      it("Then it returns nested config as an object", async () => {
        process.chdir(nestedFixturesDir);
        const result = await getConfig("/foo");
        expect(result).toEqual({
          "/bar/greeting": "Hello, world"
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
      expect(result).toEqual({});
    });
  });
});

describe("Given there is a config.json file present", () => {
  describe("When getConfig is called with config.json as the file name", () => {
    const getConfig = local("config.json");
    it("Then it returns the config object", async () => {
      process.chdir(customFixturesDir);
      const result = await getConfig("/foo");
      expect(result).toEqual({
        "/bar": "baz"
      });
    });
  });
});
