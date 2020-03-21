import path from "path";
import { withValidation, Validator } from "../lib";

const originalWorkingDirectory = process.cwd();
const fixturesDirectory = path.join(__dirname, "../", "tests");

describe("Given I have specified a validator", () => {
  beforeEach(() => process.chdir(originalWorkingDirectory));

  describe("And all required SSM parameters are present in a local .ssm.json file", () => {
    describe("When I call get config", () => {
      it("Then returns a strongly typed config object", async () => {
        process.chdir(path.join(fixturesDirectory, "complex"));

        interface MyConfig {
          foo?: string;
          bar: string;
          secret: string;
          nested: {
            value: string;
          };
        }

        const validateMyConfig = (v: Validator): MyConfig => {
          return {
            foo: v.optional("/foo"),
            bar: v.required("/bar"),
            secret: v.required("/secret"),
            nested: {
              value: v.required("/nested/value")
            }
          };
        };

        const getConfig = withValidation(validateMyConfig);
        const result = await getConfig("/foo");
        expect(result).toEqual({
          bar: "baz",
          secret: "localsecret",
          nested: {
            value: "this config is nested"
          }
        });
      });
    });
  });
});
