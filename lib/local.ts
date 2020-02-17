import fs from "fs";
import { GetConfigFunc } from "./types";

const LOCAL_FILE_NAME = ".ssm.json";

export const getConfig: GetConfigFunc = async namespace => {
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
