import { isNil } from './utils/is-nil';
import parse from 'minimist';
import { context } from './context';
import {
  ActionOptions,
  optionsMetadataKey,
} from './decorators/action.decorator';
import { paramMetadataKey, ParamPairs } from './decorators/param.decorator';
import {
  Constructor,
  importClassesFromDirectories,
} from './utils/import-class-by-dir';
import { help } from './help-command';

type ExplorerOptions = {
  actions?: Constructor[];
  fromDir?: string[];
};

export class Explorer {
  constructor(options: ExplorerOptions) {
    this.bind(options.actions);

    const { fromDir } = options;
    if (!isNil(fromDir)) {
      this.bind(importClassesFromDirectories(fromDir));
    }
  }

  public async execute() {
    const argv = this.parseArgv();
    const command = argv._[0];

    const action = context.actions[command];

    if (argv['h'] || argv['help'] || isNil(action)) {
      help(argv._[0]);
      return;
    }

    const { Instance, params } = action;

    params.forEach(({ key, options }) => {
      const {
        required,
        name,
        alias,
        defaultValue,
        validation,
        transformer,
        choices,
      } = options;

      const value = argv[key] || this.getByAlias(argv, alias) || defaultValue;

      if (value !== defaultValue && !isNil(choices)) {
        if (!choices.includes(value)) {
          console.log(`${value} is not in ${choices.join(', ')}`);
          help(argv._[0]);
        }
      }

      if (value !== defaultValue && !isNil(validation)) {
        const isValid = validation(value);

        if (!isValid) {
          console.log(`Invalid value for ${key}`);
          process.exit(1);
        }
      }

      if (required && isNil(value)) {
        console.log(`${name} is required`);
        process.exit(1);
      } else {
        if (!isNil(transformer)) {
          action.Instance.prototype[key] = transformer(value);
        } else {
          action.Instance.prototype[key] = value;
        }
      }
    });

    await new Instance().execute();
    process.exit(0);
  }

  private bind(actions: Constructor[] = []) {
    actions.forEach((instance: Constructor) => {
      const clazz = new instance();
      const params: ParamPairs[] =
        Reflect.getMetadata(paramMetadataKey, clazz) ?? [];

      const options: ActionOptions =
        Reflect.getMetadata(optionsMetadataKey, instance) ?? {};

      context.actions[options.command] = {
        params,
        options,
        Instance: instance,
      };
    });
  }

  private parseArgv() {
    return parse<Record<string, unknown>>(process.argv.slice(2));
  }

  private getByAlias(object: Record<string, unknown>, alias?: string) {
    if (isNil(alias)) {
      return null;
    }

    return object[alias];
  }
}
