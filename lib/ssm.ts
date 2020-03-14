import AWS from "aws-sdk";
import { GetConfigFunc, Config } from "./types";

export const ssm = (
  client: AWS.SSM = new AWS.SSM()
): GetConfigFunc => async namespace => {
  const params: AWS.SSM.GetParametersByPathRequest = {
    Path: namespace + "/",
    Recursive: true,
    WithDecryption: true
    // TODO: Handle pagination
  };
  const res = await client.getParametersByPath(params).promise();
  const result: Config = {};

  res.Parameters?.forEach(p => {
    if (!p.Name || !p.Value) {
      return;
    }
    const name = p.Name.substr(namespace.length);
    result[name] = p.Value;
  });

  return result;
};
