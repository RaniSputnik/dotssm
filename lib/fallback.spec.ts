import { MaybeConfig } from "./types";
import { fallback } from "./fallback";

const anyNamespace = "some/namespace";

describe("Given there is a config func and fallback", () => {
  describe("When the first config func returns a valid config", () => {
    const firstConfig = jest.fn();
    const secondConfig = jest.fn();
    let result: MaybeConfig;
    beforeAll(async () => {
      firstConfig.mockResolvedValue({ first: "first" });
      secondConfig.mockResolvedValue({ second: "second" });
      result = await fallback(firstConfig, secondConfig)(anyNamespace);
    });

    it("Then the first config is returned", async () => {
      expect(result).toEqual({ first: "first" });
    });

    it("And the second config is never invoked", async () => {
      expect(secondConfig).toHaveBeenCalledTimes(0);
    });
  });

  describe("When the first config func returns undefined", () => {
    const firstConfig = jest.fn();
    const secondConfig = jest.fn();
    let result: MaybeConfig;
    beforeAll(async () => {
      firstConfig.mockResolvedValue(undefined);
      secondConfig.mockResolvedValue({ second: "second" });
      result = await fallback(firstConfig, secondConfig)(anyNamespace);
    });

    it("Then the second config is returned", async () => {
      expect(result).toEqual({ second: "second" });
    });

    it("And the first config is invoked", async () => {
      expect(firstConfig).toHaveBeenCalledTimes(1);
    });

    it("And the second config is invoked", async () => {
      expect(secondConfig).toHaveBeenCalledTimes(1);
    });
  });
});
