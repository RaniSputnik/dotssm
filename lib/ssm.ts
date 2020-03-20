import AWS from "aws-sdk";
import { GetConfigFunc, Config } from "./types";

const PAGE_SIZE = 10; // Currently the maximum page size for loading from SSM
const MAX_PAGES = 100; // For a maximum limit of 1000 params loaded, should be plenty

export const ssm = (
  client: AWS.SSM = new AWS.SSM()
): GetConfigFunc => async namespace => {
  const result: Config = {};

  let nextToken = undefined;
  for (var i = 0; i < MAX_PAGES; i++) {
    const params: AWS.SSM.GetParametersByPathRequest = {
      Path: namespace,
      Recursive: true,
      WithDecryption: true,
      MaxResults: PAGE_SIZE,
      NextToken: nextToken
    };
    const res = await client.getParametersByPath(params).promise();

    res.Parameters?.forEach(p => {
      if (!p.Name || !p.Value) {
        return;
      }
      const name = p.Name.substr(namespace.length);
      result[name] = p.Value;
    });

    nextToken = res.NextToken;
    if (!nextToken) {
      return result;
    }
  }

  return result;
};
