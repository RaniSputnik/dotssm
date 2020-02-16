import fs from "fs";
import { MaybeConfig } from "./types";

const LOCAL_FILE_NAME = ".ssm.json";

export const getConfig = async (namespace: string): Promise<MaybeConfig> => {
  return new Promise(resolve => {
    fs.readFile(LOCAL_FILE_NAME, (err, data) => {
      if (err) {
        // TODO: Is there any errors here that we should not ignore?
        return resolve(undefined);
      }
      const contents = JSON.parse(data.toString("utf-8"));
      const config = contents[namespace];
      resolve(config);
    });
    return true;
  });
};
