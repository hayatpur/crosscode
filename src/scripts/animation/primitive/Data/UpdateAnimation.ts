import { Accessor, Data } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationData, AnimationGraphRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode } from '../AnimationNode';

export default class PlaceAnimation extends AnimationNode {
    dataSpecifier: Accessor[];
    updateStep: string;
    newValue: any;

    constructor(dataSpecifier: Accessor[], updateStep: string, newValue: any, options = {}) {
        super({ ...options, duration: 80 });
        this.dataSpecifier = dataSpecifier;

        this.updateStep = updateStep;
        this.newValue = newValue;
    }

    begin(
        environment: Environment,
        options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }
    ) {
        super.begin(environment, options);
    }

    seek(environment: Environment, time: number) {
        let t = super.ease(time / this.duration);

        const data = environment.resolvePath(this.dataSpecifier, `${this.id}_Data`) as Data;

        if (t <= 0.8) {
            // Show the step
            data.transform.step = this.updateStep;
        } else {
            // Apply the new value
            data.transform.step = null;

            data.value = this.newValue;
        }
    }

    end(environment: Environment, options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
        const data = environment.resolvePath(this.dataSpecifier, null) as Data;
        // const input = environment.resolvePath(this.inputSpecifier) as Data;
        // const to = environment.resolvePath(this.outputSpecifier) as Data;
        if (options.baking) {
            this.computeReadAndWrites({ location: environment.getMemoryLocation(data).foundLocation, id: data.id });
        }
        // if (to instanceof Environment) {
        //     environment.removeAt(environment.getMemoryLocation(input).foundLocation);
        // } else {
        //     // Remove the copy
        //     environment.removeAt(environment.getMemoryLocation(input).foundLocation);
        //     to.replaceWith(input, { frame: true, id: true });
        // }
        // input.transform.floating = false;
        // input.transform.z = 0;
    }

    computeReadAndWrites(data: AnimationData) {
        this._reads = [data];
        this._writes = [data];
    }
}
