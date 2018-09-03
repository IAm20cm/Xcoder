import 'reflect-metadata';

export type ParamOptions = {
  name: string;
  description?: string;
  required?: boolean;
  alias?: string;
  defaultValue?: unknown;
  choices?: unknown[];
  validation?: (value: string) => boolean;
  transformer?: (value: string) => unknown;
};

export type ParamPairs = {
  key: string;
  options: ParamOptions;
};

export const paramMetadataKey = Symbol('parameter');
export const paramOptionsMetadataKey = Symbol('parameter:options');

export function Param(options: ParamOptions): PropertyDecorator {
  return (target, propertyKey: string) => {
    const params = Reflect.getMetadata(paramMetadataKey, target) || [];

    Reflect.defineMetadata(
      paramMetadataKey,
      [...params, { key: propertyKey, options }],
      target,
    );
  };
}
