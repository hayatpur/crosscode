import { Accessor, Data, DataType } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationData } from '../../graph/AnimationGraph';
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

    begin(environment: Environment, options = { baking: false }) {
        super.begin(environment, options);

        let location = null;
        let data = null;

        if (this.existingMemorySpecifier != null) {
            data = environment.resolvePath(this.existingMemorySpecifier) as Data;
            location = environment.getMemoryLocation(data).foundLocation;
        } else {
            data = new Data({ type: DataType.Literal, value: undefined });
            location = environment.addDataAt([], data);
        }

        environment.declare(this.identifier, location);

        if (options.baking) {
            this.computeReadAndWrites({ location, id: data.id });
        }
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment, options = { baking: false }) {}

    computeReadAndWrites(data: AnimationData) {
        this._reads = [data];
        this._writes = [];
    }
}
