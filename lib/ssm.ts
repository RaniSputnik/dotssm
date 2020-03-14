import AWS from "aws-sdk";
import { GetConfigFunc } from "./types";

export const ssm = (
  client: AWS.SSM = new AWS.SSM()
): GetConfigFunc => async namespace => {
  const params: AWS.SSM.GetParametersByPathRequest = {
    Path: namespace,
    Recursive: true,
    WithDecryption: true
    // TODO: Handle pagination
  };
  const res = await client.getParametersByPath(params).promise();
  const result = {};

  // TODO: How do we handle two keys that conflict with one another?
  // eg. /foo/bar/config and /foo/bar
  // That can't be represented in the format that config is currently returned in
  // It probably should result in an error.
  res.Parameters?.forEach(p => {
    if (!p.Name || !p.Value) {
      return;
    }
    const name = p.Name.substr(namespace.length);
    const parts = name.split("/").filter(v => v.length > 0);
    set(result, parts, p.Value);
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
  const key = path.shift();
  if (key) {
    target[key] = inner;
    set(inner, path, value);
  }
};
