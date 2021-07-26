import { Accessor, AccessorType, Data, DataParams, DataType } from '../../environment/Data';
import { Environment } from '../../environment/Environment';
import { AnimationNode } from './AnimationNode';

export class CreateLiteralAnimation extends AnimationNode {
    value: string | number | bigint | boolean | RegExp;
    outputSpecifier: Accessor[];
    dataSpecifier: Accessor[];

    constructor(value: string | number | bigint | boolean | RegExp, outputSpecifier: Accessor[]) {
        super();

        this.value = value;
        this.outputSpecifier = outputSpecifier;

        this.base_duration = 30;
    }

    begin(environment: Environment) {
        const data = new Data({
            type: DataType.Number,
            value: this.value as number,
        });

        data.transform.opacity = 0;

        this.dataSpecifier = environment.addDataAt(this.outputSpecifier, data);
        // environment.bindVariable('_CreateLiteralAnimation', environment.getMemoryLocation(data).foundLocation);
    }

    seek(environment: Environment, time: number) {
        let t = this.ease(time / this.duration);
        const data = environment.resolvePath(this.dataSpecifier) as Data;
        data.transform.opacity = t;
    }

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
