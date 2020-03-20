import AWS from "aws-sdk";
import { GetConfigFunc, Config } from "./types";

const PAGE_SIZE = 10; // Currently the maximum page size for loading from SSM
const MAX_PAGES = 100; // For a maximum limit of 1000 params loaded, should be plenty
const MAX_PARAMETERS = PAGE_SIZE * MAX_PAGES;

export type GetByPathParams = AWS.SSM.GetParametersByPathRequest;
export type GetByPathResult = AWS.SSM.GetParametersByPathResult;
export type GetByPathErr = AWS.AWSError;
export type GetByPathCallback = (
  err?: GetByPathErr,
  data?: GetByPathResult
) => void;
export interface SSMClient {
  getParametersByPath(
    params: GetByPathParams,
    callback: GetByPathCallback
  ): void;
}

export const ssm = (
  client: SSMClient = new AWS.SSM()
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
    const res = await getParametersByPath(client, params);

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

  throw new Error(
    `Failed to retrieve all parameters,` +
      `maximum number of parameters reached (${MAX_PARAMETERS})`
  );
};

// Promisify AWS's callback structure (which is easier to mock)
const getParametersByPath = (
  client: SSMClient,
  params: GetByPathParams
): Promise<GetByPathResult> => {
  return new Promise((resolve, reject) => {
    client.getParametersByPath(
      params,
      (err?: GetByPathErr, data?: GetByPathResult) => {
        err ? reject(err) : resolve(data);
      }
    );
  });
};
