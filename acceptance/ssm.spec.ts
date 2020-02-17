import { getConfig } from "../lib";

describe("Given there are two SSM parameters prefixed with /foo", () => {
  describe("And there is no .ssm file in the current working directory", () => {
    describe("When I call getConfig with the /foo namespace", () => {
      it("Then I successfully retrieve the two config values from SSM", async () => {
        const result = await getConfig("/foo/");
        expect(result).toMatchObject({ bar: "bar", secret: "somethingsecret" });
      });
    });
  });
});
