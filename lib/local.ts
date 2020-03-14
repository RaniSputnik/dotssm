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
  const parts = namespace.split("/").filter(v => v.length > 0);
  let maybeConfig = obj;
  parts.every(part => {
    maybeConfig = maybeConfig[part];
    return maybeConfig;
  });
  return maybeConfig; // TODO: Shouldn't we check maybeConfig is defined?
};
