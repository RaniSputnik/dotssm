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
        const config = createConfig(contents, namespace);
        return resolve(config);
      });
    });
  };
};

const createConfig = (obj: object, namespace: string): Config => {
  const result: Config = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (!key.startsWith(namespace)) {
      return;
    }
    const trimmedKey = key.substr(namespace.length);
    if (trimmedKey.length === 0) {
      return;
    }
    // TODO: Should we throw an error here if the value isn't a string?
    result[trimmedKey] = String(value);
  });
  return result;
};
