export const NO_CONFIG = {};

export type Config = { [key: string]: string | Config }; // TODO: Support string list type?

export type GetConfigFunc = (namespace: string) => Promise<Config>;
