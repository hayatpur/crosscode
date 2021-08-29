import { Accessor, Data } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationData, AnimationGraphRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class PlaceAnimation extends AnimationNode {
    inputSpecifier: Accessor[];
    outputSpecifier: Accessor[];

    constructor(inputSpecifier: Accessor[], outputSpecifier: Accessor[], options: AnimationOptions = {}) {
        super(options);
        this.inputSpecifier = inputSpecifier;
        this.outputSpecifier = outputSpecifier;
    }

    begin(
        environment: Environment,
        options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }
    ) {
        super.begin(environment, options);
    }

    seek(environment: Environment, time: number) {
        let t = super.ease(time / this.duration);

        let input = environment.resolvePath(this.inputSpecifier, null) as Data;

        input.transform.z = 1 - t;
    }

    end(environment: Environment, options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
        const input = environment.resolvePath(this.inputSpecifier, null) as Data;
        const to = environment.resolvePath(this.outputSpecifier, `${this.id}_to`) as Data;

        if (options.baking) {
            this.computeReadAndWrites(
                { location: environment.getMemoryLocation(input).foundLocation, id: input.id },
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

        input.transform.floating = false;
        input.transform.z = 0;
    }

    computeReadAndWrites(inputData: AnimationData, outputData: AnimationData) {
        this._reads = [inputData];
        this._writes = [outputData];
    }
}
