import { Environment } from '../../../environment/Environment';
import { AnimationNode } from '../AnimationNode';

export class ArrayEndAnimation extends AnimationNode {
    constructor() {
        super();

        this.base_duration = 5;
    }

    begin(environment: Environment) {}

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
