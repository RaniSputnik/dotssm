import { GetConfigFunc, Config } from "./types";

export const cache = (getConfig: GetConfigFunc): GetConfigFunc => {
  let promise: Promise<Config>;

  return (namespace: string): Promise<Config> => {
    if (promise) {
      return promise;
    }
    promise = getConfig(namespace);
    return promise;
  };
};
