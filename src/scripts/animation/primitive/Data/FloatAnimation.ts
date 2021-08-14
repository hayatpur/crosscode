import { Accessor, Data } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationData } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class FloatAnimation extends AnimationNode {
    dataSpecifier: Accessor[];

    constructor(dataSpecifier: Accessor[], options: AnimationOptions = {}) {
        super(options);
        this.dataSpecifier = dataSpecifier;
    }

    begin(environment: Environment, options = { baking: false }) {
        super.begin(environment, options);

        if (options.baking) {
            const data = environment.resolvePath(this.dataSpecifier) as Data;
            this.computeReadAndWrites({ location: environment.getMemoryLocation(data).foundLocation, id: data.id });
        }
    }

    seek(environment: Environment, time: number) {
        let t = super.ease(time / this.duration);
        const data = environment.resolvePath(this.dataSpecifier) as Data;
        data.transform.floating = true;
        data.transform.z = t;
    }

    end(environment: Environment, options = { baking: false }) {}

    computeReadAndWrites(data: AnimationData) {
        this._reads = [data];
        this._writes = [];
    }
}
