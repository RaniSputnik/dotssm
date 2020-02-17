import path from "path";
import { getConfig } from "../lib";

const originalWorkingDirectory = process.cwd();
const fixturesDirectory = path.join(__dirname, "../", "tests");

describe("Given there are two SSM parameters prefixed with /foo", () => {
  beforeEach(() => process.chdir(originalWorkingDirectory));

  describe("And there is no .ssm file in the current working directory", () => {
    describe("When I call getConfig with the foo namespace", () => {
      it("Then I successfully retrieve the two config values from SSM", async () => {
        const result = await getConfig("/foo/");
        expect(result).toMatchObject({ bar: "bar", secret: "somethingsecret" });
      });
    });
  });

  describe("And there is a valid .ssm file in the current working directory", () => {
    describe("When I call getConfig with the foo namespace", () => {
      it("Then I successfully retrieve the two config values from SSM", async () => {
        process.chdir(path.join(fixturesDirectory, "multiple-keys"));
        const result = await getConfig("/foo/");
        expect(result).toMatchObject({ bar: "baz", secret: "localsecret" });
      });
    });
  });
});
