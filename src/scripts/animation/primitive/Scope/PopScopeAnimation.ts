import { Environment } from '../../../environment/Environment';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class PopScopeAnimation extends AnimationNode {
    constructor(options: AnimationOptions = {}) {
        super(options);
    }

    begin(environment: Environment, options = { baking: false }) {
        super.begin(environment, options);
        environment.popScope();
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment) {}
}
