import { GetConfigFunc, Config } from "./types";
import { fallback } from "./fallback";
import { local } from "./local";
import { ssm } from "./ssm";
import { cache } from "./cache";
import { ValidatorFunc, validation } from "./validation";

// Re-export types so that they can be used in consuming packages
export { GetConfigFunc, Config, NO_CONFIG } from "./types";
export { ValidatorFunc, Validator } from "./validation";

/**
 * Used to retrieve config from either a local file or parameter store.
 * Returns an empty config if there are no values found in the given namespace.
 * Searches for the local file at `.ssm.json` in the current working directory.
 *
 * @param namespace The SSM namespace to search for the application config
 * @return a promise that resolves to an object containing the configuration
 */
export const getConfig: GetConfigFunc = fallback(local(), ssm());

/**
 * Factory method used to create a config retrieving function using the provided
 * SSM client. Identical to `getConfig` except that you must provide your own SSM client.
 *
 * @param client The client to use to retrieve values from SSM.
 * @return a function that can be called with a namespace value to retrieve config.
 */
export function withAWSClient(client: AWS.SSM): GetConfigFunc {
  return fallback(local(), ssm(client));
}

/**
 * Wraps a config getter function with an in-memory cache that prevents refetching
 * values for the lifetime of the config getter. Said another way, ensures that the given
 * config getter function is only ever called once.
 *
 * @param fn The config getter function to wrap with the cache, uses the `getConfig` function by default
 * @return a function that can be called with a namespace value to retrieve config.
 */
export function withCache(): GetConfigFunc;
export function withCache<T>(fn: GetConfigFunc<T>): GetConfigFunc<T>;
export function withCache<T>(
  fn: GetConfigFunc<T | Config> = getConfig
): GetConfigFunc<T> {
  return cache(fn as GetConfigFunc<T>);
}

/**
 * Gets config and validates the result to ensure it conforms to a given spec.
 * Optionally accepts a config func so that a custom AWS client can be used.
 *
 * @param v The validation function that will be used to detect an invalid config.
 * @param configFunc The function that will be called to fetch the config.
 */
export function withValidation<T>(
  v: ValidatorFunc<T>,
  configFunc: GetConfigFunc = getConfig
): GetConfigFunc<T> {
  return validation(v, configFunc);
}
