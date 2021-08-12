import { Accessor, AccessorType, Data, DataType } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
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
        if (data.type == DataType.ID) {
            data = environment.resolve({ type: AccessorType.ID, value: data.value as string }) as Data;
        }

        data.frame -= 2;
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment) {}
}
