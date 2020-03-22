import { GetConfigFunc } from "./types";

export const cache = <T>(getConfig: GetConfigFunc<T>): GetConfigFunc<T> => {
  let promise: Promise<T>;

  return (namespace: string): Promise<T> => {
    if (promise) {
      return promise;
    }
    promise = getConfig(namespace);
    return promise;
  };
};
