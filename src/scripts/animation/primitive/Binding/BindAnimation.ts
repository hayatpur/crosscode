import { Accessor, Data, DataType } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export class BindAnimation extends AnimationNode {
    identifier: string;
    existingMemorySpecifier: Accessor[];

    constructor(identifier: string, existingMemorySpecifier: Accessor[] = null, options: AnimationOptions = {}) {
        super(options);

        this.identifier = identifier;
        this.existingMemorySpecifier = existingMemorySpecifier;

        this.base_duration = 5;
    }

    begin(environment: Environment) {
        if (this.existingMemorySpecifier != null) {
            const existingMemory = environment.resolvePath(this.existingMemorySpecifier) as Data;
            environment.declare(this.identifier, environment.getMemoryLocation(existingMemory).foundLocation);
        } else {
            const temp = new Data({ type: DataType.Literal, value: undefined });
            const loc = environment.addDataAt([], temp);

            environment.declare(this.identifier, loc);
        }
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment) {}
}
