import { cache } from "./cache";
import { GetConfigFunc, Config } from "./types";

describe("Given there is a config cache", () => {
  const stubbedResult = { "/foo": "bar" };
  const anyNamespace = "/any/namespace";

  let getConfigStub: jest.Mock;
  let getConfig: GetConfigFunc;
  let result: Config;
  beforeEach(() => {
    getConfigStub = jest.fn().mockResolvedValue(stubbedResult);
    getConfig = cache(getConfigStub);
  });

  describe("When the config is fetched", () => {
    beforeEach(async () => (result = await getConfig(anyNamespace)));

    it("Then returns the config result", async () => {
      expect(result).toEqual(stubbedResult);
    });
  });

  describe("And the config has already been fetched", () => {
    beforeEach(() => getConfig(anyNamespace));

    describe("When the config is fetched a second time", () => {
      beforeEach(async () => (result = await getConfig(anyNamespace)));

      it("Then the config result is returned", async () => {
        expect(result).toEqual(stubbedResult);
      });

      it("Then the config was not refetched", () => {
        expect(getConfigStub).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("When the config is fetched by two consumers simultaneously", () => {
    let results: Config[];
    beforeEach(async () => {
      results = await Promise.all([
        getConfig(anyNamespace),
        getConfig(anyNamespace)
      ]);
    });

    it("Then the config result is returned correctly twice", async () => {
      expect(results[0]).toEqual(stubbedResult);
      expect(results[1]).toEqual(stubbedResult);
    });

    it("Then the config is only fetched once", async () => {
      expect(getConfigStub).toHaveBeenCalledTimes(1);
    });
  });
});
