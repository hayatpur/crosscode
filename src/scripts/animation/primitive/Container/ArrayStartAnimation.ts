import {
  Accessor,
  AccessorType,
  Data,
  DataType,
} from "../../../environment/Data";
import { Environment } from "../../../environment/Environment";
import { AnimationData } from "../../graph/AnimationGraph";
import { AnimationNode, AnimationOptions } from "../AnimationNode";

export class ArrayStartAnimation extends AnimationNode {
  dataSpecifier: Accessor[];

  constructor(dataSpecifier: Accessor[], options: AnimationOptions = {}) {
    super(options);

    this.dataSpecifier = dataSpecifier;
    this.base_duration = 5;
  }

  begin(environment: Environment, options = { baking: false }) {
    super.begin(environment, options);

    const output = environment.resolvePath(this.dataSpecifier) as Data;
    output.type = DataType.Array;
    output.value = [];

    const ArrayExpression = environment.resolvePath(
      [{ type: AccessorType.Symbol, value: "_ArrayExpression" }],
      {
        noResolvingId: true,
      }
    ) as Data;
    ArrayExpression.value = output.id;

    if (options.baking) {
      this.computeReadAndWrites({
        location: environment.getMemoryLocation(output).foundLocation,
        id: output.id,
      });
    }
  }

  seek(environment: Environment, time: number) {}

  end(environment: Environment, options = { baking: false }) {}

  computeReadAndWrites(data: AnimationData) {
    this._reads = [data];
    this._writes = [data];
  }
}
