import { Accessor, AccessorType, Data, DataType } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export class ArrayStartAnimation extends AnimationNode {
    outputSpecifier: Accessor[];

    constructor(outputSpecifier: Accessor[], options: AnimationOptions = {}) {
        super(options);

        this.outputSpecifier = outputSpecifier;
        this.base_duration = 5;
    }

    begin(environment: Environment, options = { baking: false }) {
        super.begin(environment, options);
        const output = environment.resolvePath(this.outputSpecifier) as Data;
        output.type = DataType.Array;
        output.value = [];

        // const data = new Data(params)
        // environment.addDataAt(this.outputSpecifier, data)

        const ArrayExpression = environment.resolvePath([{ type: AccessorType.Symbol, value: '_ArrayExpression' }], {
            noResolvingId: true,
        }) as Data;
        ArrayExpression.value = output.id;
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment) {
        // const input = view.find(this.inputSpecifier);
        // const output = view.find(this.outputSpecifier);
        // input.type = 'Array';
        // input.value = [];
        // output.value = input;
        // // Create the array container - TODO: incorporate indexer
        // const arrayContainer = new ArrayContainer();
        // output.container.addContainer(arrayContainer);
        // input.container = arrayContainer;
    }
}
