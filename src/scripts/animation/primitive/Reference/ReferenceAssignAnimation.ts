import { Accessor, AccessorType, Data } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class ReferenceAssignAnimation extends AnimationNode {
    inputSpecifier: Accessor[];
    constructor(inputSpecifier: Accessor[], options: AnimationOptions = {}) {
        super(options);
        this.inputSpecifier = inputSpecifier;
    }

    begin(environment: Environment, options = { baking: false }) {
        super.begin(environment, options);
        const data = environment.resolvePath(this.inputSpecifier) as Data;

        const LatestExpression = environment.resolvePath([{ type: AccessorType.Symbol, value: '_LatestExpression' }], {
            noResolvingId: true,
        }) as Data;

        LatestExpression.value = data.id;
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment) {}
}
