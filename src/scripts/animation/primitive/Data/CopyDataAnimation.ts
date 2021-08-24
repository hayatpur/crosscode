import { Accessor, Data, DataType } from "../../../environment/Data";
import { Environment } from "../../../environment/Environment";
import { AnimationData } from "../../graph/AnimationGraph";
import { AnimationNode, AnimationOptions } from "../AnimationNode";

export default class CopyDataAnimation extends AnimationNode {
  dataSpecifier: Accessor[];
  outputRegister: Accessor[];
  hardCopy: boolean;

  constructor(
    dataSpecifier: Accessor[],
    outputRegister: Accessor[],
    options: AnimationOptions = {}
  ) {
    super(options);
    this.dataSpecifier = dataSpecifier;
    this.outputRegister = outputRegister;

    this.hardCopy = false;
  }

  begin(environment: Environment, options = { baking: false }) {
    super.begin(environment, options);
    // console.log(this.dataSpecifier)
    const data = environment.resolvePath(this.dataSpecifier) as Data;
    const copy = data.copy(false);
    copy.transform.floating = true;

    const location = environment.addDataAt([], copy);
    environment._temps[`CopyDataAnimation${this.id}`] = location;

    // Put it in the floating stack
    const register = environment.resolvePath(this.outputRegister) as Data;
    register.replaceWith(new Data({ type: DataType.ID, value: copy.id }));

    if (this.hardCopy) {
      data.value = undefined;
    }

    if (options.baking) {
      this.computeReadAndWrites(
        {
          location: environment.getMemoryLocation(data).foundLocation,
          id: data.id,
        },
        { location, id: copy.id }
      );
    }
  }

  seek(environment: Environment, time: number) {
    let t = super.ease(time / this.duration);
    const copy = environment.resolvePath(
      environment._temps[`CopyDataAnimation${this.id}`]
    ) as Data;
    copy.transform.z = t;
  }

  end(environment: Environment, options = { baking: false }) {}

  computeReadAndWrites(original: AnimationData, copy: AnimationData) {
    this._reads = [original];
    this._writes = [copy];
  }
}
