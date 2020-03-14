import fs from "fs";
import { GetConfigFunc, Config, NO_CONFIG } from "./types";

const LOCAL_FILE_NAME = ".ssm.json";

export const local: GetConfigFunc = async namespace => {
  return new Promise(resolve => {
    fs.readFile(LOCAL_FILE_NAME, (err, data) => {
      if (err) {
        // TODO: Is there any errors here that we should not ignore?
        return resolve(NO_CONFIG);
      }
      const contents = JSON.parse(data.toString("utf-8"));
      const config = findConfig(contents, namespace);
      resolve(config);
    });
    return true;
  });
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
