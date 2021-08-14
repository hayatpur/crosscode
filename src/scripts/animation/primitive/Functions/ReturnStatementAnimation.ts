import { Accessor, Data } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationData } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class ReturnStatementAnimation extends AnimationNode {
    inputSpecifier: Accessor[];

    constructor(inputSpecifier: Accessor[], options: AnimationOptions = {}) {
        super(options);
        this.inputSpecifier = inputSpecifier;
    }

    begin(environment: Environment, options = { baking: false }) {
        super.begin(environment, options);
        let data = environment.resolvePath(this.inputSpecifier) as Data;

        data.frame -= 2;

        if (options.baking) {
            this.computeReadAndWrites({ location: environment.getMemoryLocation(data).foundLocation, id: data.id });
        }
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment, options = { baking: false }) {}

    computeReadAndWrites(data: AnimationData) {
        this._reads = [data];
        this._writes = [];
    }
}
