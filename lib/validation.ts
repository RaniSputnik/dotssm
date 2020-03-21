import { GetConfigFunc, GetTypedConfigFunc, Config } from "./types";

interface ValidationError {
  name: string;
  error: string;
}

type RuleFunc = (field: string) => ValidationError | undefined;

// TODO: Is there a better name we can give to this interface?
// There are so many "validators" in this file
export interface Validator {
  required: (value: string, ...rules: RuleFunc[]) => string;
  optional: (value: string, ...rules: RuleFunc[]) => string | undefined;
  error: (value: string, message: string) => void;
}

export type ValidatorFunc<T> = (v: Validator) => T;

/* SimpleValidator implements the validator interface
 * and aggregates all validation errors for a given config */
class SimpleValidator implements Validator {
  private readonly _errors: ValidationError[] = [];
  constructor(private readonly config: Config) {}

  required(value: string, ...rules: RuleFunc[]): string {
    const result = this.config[value];
    if (result) {
      return result;
    }
    this.error(value, `${value} is required`);
    return "<missing>";
  }

  optional(value: string, ...rules: RuleFunc[]): string | undefined {
    return this.config[value];
  }

  error(value: string, message: string): void {
    this._errors.push({ name: value, error: message });
  }

  allErrors(): ValidationError[] {
    return [...this._errors];
  }
}

export const validation = <T>(
  validator: ValidatorFunc<T>,
  getConfig: GetConfigFunc
): GetTypedConfigFunc<T> => {
  return async (namespace: string): Promise<T> => {
    const config = await getConfig(namespace);
    const v = new SimpleValidator(config);
    const typedConfig = validator(v);
    if (v.allErrors().length > 0) {
      // TODO: Provide error details
      throw new Error("Validation failed");
    }
    return typedConfig;
  };
};
