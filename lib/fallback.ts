import { GetConfigFunc, NO_CONFIG } from "./types";

export const fallback = (
  firstFunc: GetConfigFunc,
  ...fallbackFuncs: GetConfigFunc[]
): GetConfigFunc => {
  const funcs = [firstFunc, ...fallbackFuncs];

  return async namespace => {
    for (let i = 0; i < funcs.length; i++) {
      const func = funcs[i];
      const result = await func(namespace);
      if (result && Object.keys(result).length > 0) {
        return result;
      }
    }
    return NO_CONFIG;
  };
};
