import { Accessor, Data, DataType } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationData, AnimationGraphRuntimeOptions } from '../../graph/AnimationGraph';
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

    begin(
        environment: Environment,
        options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }
    ) {
        super.begin(environment, options);

        let location = null;
        let data = null;

        if (this.existingMemorySpecifier != null) {
            data = environment.resolvePath(this.existingMemorySpecifier, `${this.id}_Existing`) as Data;
            location = environment.getMemoryLocation(data).foundLocation;
        } else {
            data = new Data({ id: `${this.id}_BindNew`, type: DataType.Literal, value: undefined });
            location = environment.addDataAt([], data, null);
        }

        environment.declare(this.identifier, location);

        if (options.baking) {
            this.computeReadAndWrites({ location, id: data.id });
        }
    }

    seek(environment: Environment, time: number) {}

    end(
        environment: Environment,
        options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }
    ) {}

    computeReadAndWrites(data: AnimationData) {
        this._reads = [data];
        this._writes = [];
    }
}
