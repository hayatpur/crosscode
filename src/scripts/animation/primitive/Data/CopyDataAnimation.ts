import { Accessor, Data, DataType } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationData, AnimationGraphRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class CopyDataAnimation extends AnimationNode {
    dataSpecifier: Accessor[];
    outputRegister: Accessor[];
    hardCopy: boolean;

    constructor(dataSpecifier: Accessor[], outputRegister: Accessor[], options: AnimationOptions = {}) {
        super(options);
        this.dataSpecifier = dataSpecifier;
        this.outputRegister = outputRegister;

        this.hardCopy = false;
    }

    begin(
        environment: Environment,
        options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }
    ) {
        super.begin(environment, options);
        // console.log(this.dataSpecifier)
        const data = environment.resolvePath(this.dataSpecifier, `${this.id}_Data`) as Data;
        const copy = data.copy(false, `${this.id}_Copy`);
        copy.transform.floating = true;

        const location = environment.addDataAt([], copy, null);
        environment._temps[`CopyDataAnimation${this.id}`] = location;

        // Put it in the floating stack
        const register = environment.resolvePath(this.outputRegister, `${this.id}_Floating`) as Data;
        register.replaceWith(new Data({ id: `${this.id}_Floating`, type: DataType.ID, value: copy.id }));

        if (this.hardCopy) {
            data.value = undefined;
        }

        if (options.baking) {
            this.computeReadAndWrites(
                {
                    location: environment.getMemoryLocation(data).foundLocation,
                    id: data.id,
                },
                { location, id: copy.id }
            );
        }
    }

    seek(environment: Environment, time: number) {
        let t = super.ease(time / this.duration);
        const copy = environment.resolvePath(environment._temps[`CopyDataAnimation${this.id}`], null) as Data;
        copy.transform.z = t;
    }

    end(
        environment: Environment,
        options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }
    ) {}

    computeReadAndWrites(original: AnimationData, copy: AnimationData) {
        this._reads = [original];
        this._writes = [copy];
    }
}
