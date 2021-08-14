import { Accessor, AccessorType, Data, DataType } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { remap } from '../../../utilities/math';
import { AnimationData } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export class CreateLiteralAnimation extends AnimationNode {
    value: string | number | bigint | boolean | RegExp;
    outputSpecifier: Accessor[];

    constructor(
        value: string | number | bigint | boolean | RegExp,
        outputSpecifier: Accessor[],
        options: AnimationOptions = {}
    ) {
        super(options);

        this.value = value;
        this.outputSpecifier = outputSpecifier;

        this.base_duration = 30;
    }

    begin(environment: Environment, options = { baking: false }) {
        super.begin(environment, options);
        const data = new Data({
            type: DataType.Literal,
            value: this.value as number | string | boolean,
        });

        data.transform.floating = true;

        environment._temps['CreateLiteralAnimation'] = environment.addDataAt([], data);

        if (options.baking) {
            this.computeReadAndWrites({ location: environment._temps['CreateLiteralAnimation'], id: data.id });
        }

        // Get the output data
        // console.log('Specifier', this.outputSpecifier);
        const output = environment.resolvePath(this.outputSpecifier) as Data;
        environment.updateLayout();

        data.transform.x = output.transform?.x ?? 0;
        data.transform.y = output.transform?.y ?? 0;

        // Put it in the floating stack
        const FloatingStack = environment.resolvePath([{ type: AccessorType.Symbol, value: '_FloatingStack' }], {
            noResolvingId: true,
        }) as Data;

        for (const id of FloatingStack.value as Data[]) {
            // console.log(id);
            const other = environment.resolvePath([{ type: AccessorType.ID, value: id.value as string }]) as Data;
            // console.log(other, other.transform.x, data.transform.x);

            if (
                data.transform.x <= other.transform.x + other.transform.width &&
                other.transform.x <= data.transform.x + data.transform.width
            ) {
                data.transform.x = other.transform.x + other.transform.width + 20;
            }
        }

        FloatingStack.addDataAt([], new Data({ type: DataType.ID, value: data.id }));
    }

    seek(environment: Environment, time: number) {
        let t = super.ease(time / this.duration);
        const data = environment.resolvePath(environment._temps['CreateLiteralAnimation']) as Data;
        data.transform.z = remap(t, 0, 1, 3, 1);
    }

    end(environment: Environment, options = { baking: false }) {
        // console.log('Ending...');
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

    computeReadAndWrites(data: AnimationData) {
        this._reads = [];
        this._writes = [data];
    }
}
