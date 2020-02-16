import { GetConfigFunc, Config } from "./types";

export const getConfig: GetConfigFunc = async (
  namespace: string
): Promise<Config> => {
  throw new Error("Not implemented");
};

export const validateSchema = (
  _schema: unknown,
  configFunc: GetConfigFunc = getConfig
): GetConfigFunc => {
  return async (_namespace: string): Promise<Config> => {
    // Get config
    // Validate the result
    // Return the config
    throw new Error("Not implemented");
  };
};
