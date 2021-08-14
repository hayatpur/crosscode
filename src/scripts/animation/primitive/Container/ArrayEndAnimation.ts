import { Environment } from '../../../environment/Environment';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export class ArrayEndAnimation extends AnimationNode {
    constructor(options: AnimationOptions = {}) {
        super(options);

        this.base_duration = 5;
    }

    begin(environment: Environment, options = { baking: false }) {
        super.begin(environment, options);

        if (options.baking) {
            super.computeReadAndWrites();
        }
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment, options = { baking: false }) {
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
