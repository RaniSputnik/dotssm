import { MaybeConfig, GetConfigFunc } from "./types";

export const fallback = (
  firstFunc: GetConfigFunc,
  ...fallbackFuncs: GetConfigFunc[]
): GetConfigFunc => {
  const funcs = [firstFunc, ...fallbackFuncs];

  return async (namespace: string): Promise<MaybeConfig> => {
    for (var i = 0; i < funcs.length; i++) {
      const func = funcs[i];
      const result = await func(namespace);
      if (!result) {
        continue;
      }
      return result;
    }
  };
};
