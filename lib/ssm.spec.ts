import {
  ssm,
  GetByPathParams,
  GetByPathResult,
  GetByPathCallback
} from "./ssm";

/* InfiniteSSMStub mocks the AWS SSM client and continuing returns
 * NextTokens forcing an infinite cycle of requests to be made. */
class InfiniteSSMStub {
  constructor() {}

  getParametersByPath = (
    _params: GetByPathParams,
    callback: GetByPathCallback
  ) => {
    const result: GetByPathResult = {
      NextToken: "something",
      Parameters: [
        {
          Name: "/any/namespace/foo/bar",
          Type: "String",
          Value: "anything"
        }
      ]
    };
    process.nextTick(() => callback(undefined, result));
  };
}

const theOffendingNamespace = "/any/namespace";

describe("Given there is more than a 1000x parameters in a single namespace", () => {
  describe("When getConfig is called", () => {
    it("Then it throws an error indicating not all results could be loaded", async () => {
      const getConfig = ssm(new InfiniteSSMStub());
      const result = getConfig(theOffendingNamespace);
      await expect(result).rejects.toEqual(expect.any(Error));
    });
  });
});
