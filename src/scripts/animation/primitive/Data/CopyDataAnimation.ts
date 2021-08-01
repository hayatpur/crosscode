import { Accessor, Data } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class CopyDataAnimation extends AnimationNode {
    dataSpecifier: Accessor[];

    constructor(dataSpecifier: Accessor[], options: AnimationOptions = {}) {
        super(options);
        this.dataSpecifier = dataSpecifier;
    }

    begin(environment: Environment) {
        const data = environment.resolvePath(this.dataSpecifier) as Data;
        const copy = data.copy();
        copy.transform.floating = true;

        const location = environment.addDataAt([], copy);
        environment.declare('_CopyDataAnimation', location);
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment) {}
}
