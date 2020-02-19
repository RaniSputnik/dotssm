export type Config = { [key: string]: string | Config }; // TODO: Support string list type?

export type MaybeConfig = Config | undefined;

export type GetConfigFunc = (namespace: string) => Promise<MaybeConfig>;
