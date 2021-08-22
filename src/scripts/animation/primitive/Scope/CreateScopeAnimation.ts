import { Environment } from '../../../environment/Environment';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class CreateScopeAnimation extends AnimationNode {
    constructor(options: AnimationOptions = {}) {
        super({ ...options, duration: 100 });
    }

    begin(environment: Environment, options = { baking: false }) {
        super.begin(environment, options);
        environment.createScope();

        if (options.baking) {
            super.computeReadAndWrites();
        }
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment, options = { baking: false }) {}
}
