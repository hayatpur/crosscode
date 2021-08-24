import { Accessor, Data, DataType, Transform } from "../../../environment/Data";
import { Environment } from "../../../environment/Environment";
import { DataMovementPath } from "../../../utilities/DataMovementPath";
import { remap } from "../../../utilities/math";
import { AnimationData } from "../../graph/AnimationGraph";
import { AnimationNode, AnimationOptions } from "../AnimationNode";

export default class MoveAndPlaceAnimation extends AnimationNode {
  inputSpecifier: Accessor[];
  outputSpecifier: Accessor[];
  noMove: boolean;

  constructor(
    inputSpecifier: Accessor[],
    outputSpecifier: Accessor[],
    noMove = false,
    options: AnimationOptions = {}
  ) {
    super({ ...options, duration: noMove ? 20 : 100 });

    this.noMove = noMove;
    this.inputSpecifier = inputSpecifier;
    this.outputSpecifier = outputSpecifier;
  }

  begin(environment: Environment, options = { baking: false }) {
    super.begin(environment, options);

    let move = environment.resolvePath(this.inputSpecifier) as Data;
    const to = environment.resolvePath(this.outputSpecifier);

    // if (move.transform.floating == false) {
    //     const copy = new Data({ type: move.type });
    //     copy.replaceWith(move, { frame: true, id: true });

    //     environment.addDataAt([], copy);
    //     copy.transform.floating = true;
    //     copy.transform.z = 0;

    //     move.value = undefined;
    //     move = copy;

    //     this.inputSpecifier = [{type: AccessorType.ID, value: move.id}];
    // }

    environment.updateLayout();

    let end_transform: Transform;

    if (to instanceof Environment) {
      // Then it doesn't have a place yet
      const placeholder = new Data({
        type: DataType.ID,
        value: "_MoveAnimationPlaceholder",
      });
      const placeholderLocation = environment.addDataAt([], placeholder);

      environment.updateLayout();
      end_transform = { ...placeholder.transform };

      environment.removeAt(placeholderLocation);
    } else {
      end_transform = { ...to.transform };
    }

    // Start position
    const start_transform = { ...move.transform };

    // Create a movement path to translate the floating container along
    const path = new DataMovementPath(start_transform, end_transform);
    path.seek(0);

    environment._temps[`MovePath${this.id}`] = path;
  }

  seek(environment: Environment, time: number) {
    let move = environment.resolvePath(this.inputSpecifier) as Data;

    // Move
    if (time <= 80 && !this.noMove) {
      let t = super.ease(remap(time, 0, 80, 0, 1));

      const path = environment._temps[`MovePath${this.id}`];
      path.seek(t);

      const position = path.getPosition(t);
      move.transform.x = position.x;
      move.transform.y = position.y;
    }
    // Place
    else {
      let t = super.ease(remap(time, 80, 100, 0, 1));
      if (this.noMove) {
        t = super.ease(remap(time, 0, 20, 0, 1));
      }
      move.transform.z = 1 - t;
    }
  }

  end(environment: Environment, options = { baking: false }) {
    this.seek(environment, this.duration);
    environment._temps[`MovePath${this.id}`]?.destroy();

    const input = environment.resolvePath(this.inputSpecifier) as Data;
    const to = environment.resolvePath(this.outputSpecifier) as Data;

    if (options.baking) {
      this.computeReadAndWrites(
        {
          location: environment.getMemoryLocation(input).foundLocation,
          id: input.id,
        },
        { location: environment.getMemoryLocation(to).foundLocation, id: to.id }
      );
    }

    if (to instanceof Environment) {
      environment.removeAt(environment.getMemoryLocation(input).foundLocation);
    } else {
      // Remove the copy
      environment.removeAt(environment.getMemoryLocation(input).foundLocation);
      to.replaceWith(input, { frame: true, id: true });
    }

    // console.log('Removing...');

    input.transform.floating = false;
    input.transform.z = 0;
  }

  computeReadAndWrites(inputData: AnimationData, outputData: AnimationData) {
    this._reads = [inputData];
    this._writes = [outputData, inputData];
  }
}
