import path from "path";
import { getConfig } from "./local";

const libDir = __dirname;
const validFixturesDir = path.join(__dirname, "fixtures", "valid");

const validNamespace = "/foo/bar";
const invalidNamespace = "/invalid/namespace";
const anyNamespace = "some/namespace";

describe("Given there is a .ssm file in the current working directory", () => {
  describe("When getConfig is called with the correct namespace", () => {
    it("Then it returns the local configuration", async () => {
      process.chdir(validFixturesDir);
      const result = await getConfig(validNamespace);
      expect(result).toEqual({
        greeting: "Hello, world"
      });
    });
  });

  describe("When getConfig is called with an invalid namespace", () => {
    it("Then it returns an empty object", async () => {
      process.chdir(validFixturesDir);
      const result = await getConfig(invalidNamespace);
      expect(result).toEqual(undefined);
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
