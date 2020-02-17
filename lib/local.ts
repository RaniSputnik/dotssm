import fs from "fs";
import { GetConfigFunc, MaybeConfig } from "./types";

const LOCAL_FILE_NAME = ".ssm.json";

export const local: GetConfigFunc = async namespace => {
  return new Promise(resolve => {
    fs.readFile(LOCAL_FILE_NAME, (err, data) => {
      if (err) {
        // TODO: Is there any errors here that we should not ignore?
        return resolve(undefined);
      }
      const contents = JSON.parse(data.toString("utf-8"));
      const config = findConfig(contents, namespace);
      resolve(config);
    });
    return true;
  });
};

const findConfig = (obj: any, namespace: string): MaybeConfig => {
  const parts = namespace.split("/").filter(v => v.length > 0);
  let maybeConfig = obj;
  parts.every(part => {
    maybeConfig = maybeConfig[part];
    return maybeConfig;
  });
  return maybeConfig;
};
