import { Environment } from '../../../environment/Environment';
import { AnimationGraphRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class PopScopeAnimation extends AnimationNode {
    constructor(options: AnimationOptions = {}) {
        super(options);
    }

    begin(
        environment: Environment,
        options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }
    ) {
        super.begin(environment, options);
        environment.popScope();

        if (options.baking) {
            super.computeReadAndWrites();
        }
    }

    seek(environment: Environment, time: number) {}

    end(
        environment: Environment,
        options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }
    ) {}
}
