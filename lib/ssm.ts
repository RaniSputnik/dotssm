import AWS from "aws-sdk";
import { GetConfigFunc } from "./types";

export const getConfig: GetConfigFunc = async namespace => {
  const ssm = new AWS.SSM();
  const params: AWS.SSM.GetParametersByPathRequest = {
    Path: namespace,
    Recursive: true,
    WithDecryption: true
    // TODO: Handle pagination
  };
  const res = await ssm.getParametersByPath(params).promise();
  const result = {};
  res.Parameters.forEach(p => {
    const name = p.Name.substr(namespace.length);
    result[name] = p.Value;
  });
  return result;
};
