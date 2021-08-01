import { Accessor, Data } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export class BindAnimation extends AnimationNode {
    identifier: string;
    dataSpecifier: Accessor[];

    constructor(identifier: string, dataSpecifier: Accessor[], options: AnimationOptions = {}) {
        super(options);

        this.identifier = identifier;
        this.dataSpecifier = dataSpecifier;

        this.base_duration = 5;
    }

    begin(environment: Environment) {
        const data = environment.resolvePath(this.dataSpecifier) as Data;
        environment.declare(this.identifier, environment.getMemoryLocation(data).foundLocation);
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment) {}
}
