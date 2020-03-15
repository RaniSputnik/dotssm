import fs from "fs";
import { GetConfigFunc, Config, NO_CONFIG } from "./types";

const NO_NAMESPACE_ERROR = `You have provided an empty namespace, this will not work when running against SSM.
Config must be prefixed by a common value eg. /mydomain/myapp`;

export const local = (localFileName: string = ".ssm.json"): GetConfigFunc => {
  return async namespace => {
    return new Promise((resolve, reject) => {
      fs.readFile(localFileName, (err, data) => {
        if (err) {
          // TODO: Is there any errors here that we should not ignore?
          return resolve(NO_CONFIG);
        }
        // Note: we do this validation here as ideally we want to
        // leave it up to AWS to throw this error if we are not running
        // this config strategy (see early exit above)
        if (namespace === "") {
          return reject(new Error(NO_NAMESPACE_ERROR));
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
