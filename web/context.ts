import { ParamPairs } from 'src/decorators/param.decorator';
import { ActionRunner } from './action.runner';
import { ActionOptions } from './decorators/action.decorator';
import { Constructor } from './utils/import-class-by-dir';

export type ActionContext<T = ActionRunner> = {
  params: ParamPairs[];
  options: ActionOptions;
  Instance: Constructor<T>;
};

export type Context = { actions: Record<string, ActionContext> };

export const context: Context = {
  actions: {},
};
