import { Accessor, AccessorType, Data, DataType } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class CopyDataAnimation extends AnimationNode {
    dataSpecifier: Accessor[];

    constructor(dataSpecifier: Accessor[], options: AnimationOptions = {}) {
        super(options);
        this.dataSpecifier = dataSpecifier;
    }

    begin(environment: Environment) {
        // console.log(this.dataSpecifier)
        const data = environment.resolvePath(this.dataSpecifier) as Data;
        const copy = data.copy();
        copy.transform.floating = true;

        const location = environment.addDataAt([], copy);
        environment._temps[`CopyDataAnimation${this.id}`] = location;

        // Put it in the floating stack
        const FloatingStack = environment.resolvePath([{ type: AccessorType.Symbol, value: '_FloatingStack' }], {
            noResolvingId: true,
        }) as Data;

        FloatingStack.addDataAt([], new Data({ type: DataType.ID, value: copy.id }));
    }

    seek(environment: Environment, time: number) {
        let t = super.ease(time / this.duration);
        const copy = environment.resolvePath(environment._temps[`CopyDataAnimation${this.id}`]) as Data;
        copy.transform.z = t;
    }

    end(environment: Environment) {}
}
