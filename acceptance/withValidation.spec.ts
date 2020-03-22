import path from "path";
import { withValidation, withCache, Validator } from "../lib";

const originalWorkingDirectory = process.cwd();
const fixturesDirectory = path.join(__dirname, "../", "tests");
const anyNamespace = "/any/namespace";

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

  describe("And I have wrapped the validator in a cache", () => {
    describe("When I call get config twice", () => {
      it("Then only ran validation once", async () => {
        interface MyConfig {
          foo: string;
        }
        const expected: MyConfig = { foo: "bar" };

        type ValidatorSpy = jest.Mock<MyConfig, [Validator]>;
        const spy: ValidatorSpy = jest.fn().mockReturnValue(expected);
        const getConfig = withCache(withValidation(spy));

        const results = await Promise.all([
          getConfig(anyNamespace),
          getConfig(anyNamespace)
        ]);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(results[0]).toEqual(expected);
        expect(results[1]).toEqual(expected);
      });
    });
  });
});
