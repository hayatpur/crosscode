import { Accessor, Data, DataType } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { remap } from '../../../utilities/math';
import { AnimationData, AnimationGraphRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export class CreateLiteralAnimation extends AnimationNode {
    value: string | number | bigint | boolean | RegExp;
    locationHint: Accessor[];
    outputRegister: Accessor[];

    constructor(
        value: string | number | bigint | boolean | RegExp,
        outputRegister: Accessor[],
        locationHint: Accessor[],

        options: AnimationOptions = {}
    ) {
        super(options);

        this.value = value;

        this.outputRegister = outputRegister;
        this.locationHint = locationHint;

        this.base_duration = 30;
    }

    begin(
        environment: Environment,
        options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }
    ) {
        super.begin(environment, options);
        const data = new Data({
            id: `${this.id}_Create`,
            type: DataType.Literal,
            value: this.value as number | string | boolean,
        });

        data.transform.floating = true;

        environment._temps[`CreateLiteralAnimation${this.id}`] = environment.addDataAt([], data, null);

        // Get the output data
        const location = environment.resolvePath(this.locationHint, `${this.id}_Location`) as Data;

        if (options.baking) {
            this.computeReadAndWrites({
                location: environment._temps[`CreateLiteralAnimation${this.id}`],
                id: data.id,
            });
        }

        environment.updateLayout();

        data.transform.x = location.transform?.x ?? 0;
        data.transform.y = location.transform?.y ?? 0;

        // Put it in the floating stack
        const outputRegister = environment.resolvePath(this.outputRegister, `${this.id}_Floating`) as Data;
        outputRegister.replaceWith(new Data({ id: `${this.id}_Floating`, type: DataType.ID, value: data.id }));
    }

    seek(environment: Environment, time: number) {
        let t = super.ease(time / this.duration);
        const data = environment.resolvePath(environment._temps[`CreateLiteralAnimation${this.id}`], null) as Data;
        data.transform.z = remap(t, 0, 1, 3, 1);
    }

    end(
        environment: Environment,
        options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }
    ) {}

    computeReadAndWrites(data: AnimationData) {
        this._reads = [];
        this._writes = [data];
    }
}
