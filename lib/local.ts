import fs from "fs";
import { GetConfigFunc, Config, NO_CONFIG } from "./types";

export const local = (localFileName: string = ".ssm.json"): GetConfigFunc => {
  return async namespace => {
    return new Promise(resolve => {
      fs.readFile(localFileName, (err, data) => {
        if (err) {
          // TODO: Is there any errors here that we should not ignore?
          return resolve(NO_CONFIG);
        }
        const contents = JSON.parse(data.toString("utf-8"));
        const config = findConfig(contents, namespace);
        return resolve(config);
      });
    });
  };
};

// TODO: Remove the any here
const findConfig = (obj: any, namespace: string): Config => {
  const parts = namespace.split("/");
  // Remove the first value - if the caller has done this correctly
  // they will have started their namespace with a leading slash.
  // We need to ignore that value.
  // We could be more tolerant here but what's the point if it's
  // not going to work against the real SSM anyway?
  // TODO: Better error message here if namespace is incorrect
  parts.shift();
  let maybeConfig = obj;
  parts.every(part => {
    maybeConfig = maybeConfig[part];
    return !!maybeConfig;
  });
  return flatten(maybeConfig || {});
};

const flatten = (obj: object, prefix = "/", aggregate: any = {}): Config => {
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === "object") {
      if (value) {
        flatten(value, prefix + key + "/", aggregate);
      }
    } else {
      aggregate[prefix + key] = value;
    }
  });
  return aggregate;
};
