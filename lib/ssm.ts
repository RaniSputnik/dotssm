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

  // TODO: How do we handle two keys that conflict with one another?
  // eg. /foo/bar/config and /foo/bar
  // That can't be represented in the format that config is currently returned in
  // It probably should result in an error.
  res.Parameters.forEach(p => {
    const name = p.Name.substr(namespace.length);
    const parts = name.split("/").filter(v => v.length > 0);
    set(result, parts, p.Value);
    console;
  });
  return result;
};

const set = (target: any, path: string[], value: string) => {
  if (path.length === 0) {
    return;
  }

  if (path.length === 1) {
    const key = path[0];
    return (target[key] = value);
  }

  const inner = {};
  target[path.shift()] = inner;
  set(inner, path, value);
};
