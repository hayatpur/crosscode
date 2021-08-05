import { Accessor, AccessorType, Data, DataType } from '../../../environment/Data'
import { Environment } from '../../../environment/Environment'
import { AnimationNode, AnimationOptions } from '../AnimationNode'

export class CreateLiteralAnimation extends AnimationNode {
    value: string | number | bigint | boolean | RegExp
    outputSpecifier: Accessor[]
    dataSpecifier: Accessor[]

    constructor(
        value: string | number | bigint | boolean | RegExp,
        outputSpecifier: Accessor[],
        options: AnimationOptions = {}
    ) {
        super(options)

        this.value = value
        this.outputSpecifier = outputSpecifier

        this.base_duration = 30
    }

    begin(environment: Environment) {
        const data = new Data({
            type: DataType.Number,
            value: this.value as number,
        })

        data.transform.opacity = 0

        console.log(this.outputSpecifier)
        environment.log()
        environment._temps['CreateLiteralAnimation'] = environment.addDataAt(this.outputSpecifier, data)
        // environment.bindVariable('_CreateLiteralAnimation', environment.getMemoryLocation(data).foundLocation);

        const LatestExpression = environment.resolvePath([{ type: AccessorType.Symbol, value: '_LatestExpression' }], {
            noResolvingId: true,
        }) as Data
        LatestExpression.value = data.id
    }

    seek(environment: Environment, time: number) {
        let t = super.ease(time / this.duration)
        // console.log(environment, environment._temps['CreateLiteralAnimation']);
        const data = environment.resolvePath(environment._temps['CreateLiteralAnimation']) as Data
        data.transform.opacity = t

        // console.log(t);
    }

    end(environment: Environment) {
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
}
