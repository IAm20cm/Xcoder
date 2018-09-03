export type ActionOptions = {
  command: string;
  description?: string;
};

export const optionsMetadataKey = Symbol('options');

export function Action(options: ActionOptions): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(optionsMetadataKey, options, target);
  };
}
