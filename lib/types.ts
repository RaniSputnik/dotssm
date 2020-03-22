export type Config = Record<string, string | undefined>; // TODO: Support string list type?

export const NO_CONFIG: Config = {};

export type GetConfigFunc<T = Config> = (namespace: string) => Promise<T>;
