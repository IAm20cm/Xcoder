export abstract class ActionRunner {
  abstract execute(): Promise<void>;
}
