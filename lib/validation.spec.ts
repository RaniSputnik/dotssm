import { validation, Validator } from "./validation";
import { GetConfigFunc } from "./types";

describe("Given a non-empty config", () => {
  interface MyConfig {
    foo?: string;
  }

  const validateRequired = (v: Validator): MyConfig => ({
    foo: v.required("/foo")
  });

  const validateOptional = (v: Validator): MyConfig => ({
    foo: v.optional("/foo")
  });

  const getValidConfig: GetConfigFunc = async () => ({ "/foo": "bar" });
  const getEmptyConfig: GetConfigFunc = async () => ({});

  describe("When a required value is present", () => {
    it("Then the validator has been called", async () => {
      const validator = jest.fn().mockReturnValue({ foo: "bar" });
      const getConfig = validation<MyConfig>(validator, getValidConfig);

      await getConfig("/any/namespace");
      expect(validator).toHaveBeenCalledTimes(1);
    });

    it("Then a strongly typed config is returned", async () => {
      const getConfig = validation(validateRequired, getValidConfig);

      const result = await getConfig("/any/namespace");
      expect(result).toEqual({ foo: "bar" });
    });
  });

  describe("When a required value is not present", () => {
    it("Then an error is raised", async () => {
      const getConfig = validation(validateRequired, getEmptyConfig);

      const promise = getConfig("/any/namespace");
      await expect(promise).rejects.toEqual(expect.any(Error));
    });
  });

  describe("When a optitonal value is not present", () => {
    it("Then the ", async () => {
      const getConfig = validation(validateOptional, getEmptyConfig);

      const result = await getConfig("/any/namespace");
      expect(result).toEqual({});
    });
  });
});
