import { Accessor, Data, DataType } from "../../../environment/Data";
import { Environment } from "../../../environment/Environment";
import { AnimationData } from "../../graph/AnimationGraph";
import { AnimationNode, AnimationOptions } from "../AnimationNode";

export default class CopyDataAnimation extends AnimationNode {
  inputState: Environment;
  outputState: Environment;
  trace: { [id: string]: AnimationData[] };
  showBefore: boolean;

  constructor(
    inputState: Environment,
    outputState: Environment,
    trace: { [id: string]: AnimationData[] } = {},
    showBefore: boolean = false,
    options: AnimationOptions = {}
  ) {
    super(options);

    this.inputState = inputState;
    this.outputState = outputState;
    this.trace = trace;

    this.showBefore = showBefore;
  }

  begin(environment: Environment, options = { baking: false }) {
    super.begin(environment, options);
  }

  seek(environment: Environment, time: number) {
    let t = super.ease(time / this.duration);
  }

  end(environment: Environment, options = { baking: false }) {}

  computeReadAndWrites(original: AnimationData, copy: AnimationData) {
    this._reads = [];
    this._writes = [];
  }
}
