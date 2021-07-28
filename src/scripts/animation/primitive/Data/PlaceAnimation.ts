import { Accessor, Data } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationNode } from '../AnimationNode';

export default class PlaceAnimation extends AnimationNode {
    inputSpecifier: Accessor[];
    outputSpecifier: Accessor[];

    constructor(inputSpecifier: Accessor[], outputSpecifier: Accessor[]) {
        super();
        this.inputSpecifier = inputSpecifier;
        this.outputSpecifier = outputSpecifier;
    }

    begin(environment: Environment) {
        const input = environment.resolvePath(this.inputSpecifier) as Data;
        // environment.removeAt(environment.getMemoryLocation(input).foundLocation);

        const to = environment.resolvePath(this.outputSpecifier) as Data;

        const loc = environment.getMemoryLocation(to).foundLocation;

        to.value = input.value;

        console.log(environment);

        // input.transform.floating = false;
    }

    seek(environment: Environment, time: number) {}

    end(environment: Environment) {}
}
