import { GetConfigFunc, Config } from "./types";
import { fallback } from "./fallback";
import { getConfig as getConfigLocal } from "./local";
import { getConfig as getConfigSSM } from "./ssm";

export const getConfig: GetConfigFunc = fallback(getConfigLocal, getConfigSSM);

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
