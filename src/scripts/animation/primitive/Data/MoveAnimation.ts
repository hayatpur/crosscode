import { Accessor, Data, DataType, Transform } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { DataMovementPath } from '../../../utilities/DataMovementPath';
import { AnimationData, AnimationGraphRuntimeOptions } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class MoveAnimation extends AnimationNode {
    inputSpecifier: Accessor[];
    outputSpecifier: Accessor[];

    constructor(inputSpecifier: Accessor[], outputSpecifier: Accessor[], options: AnimationOptions = {}) {
        super({ ...options, duration: 80 });

        this.inputSpecifier = inputSpecifier;
        this.outputSpecifier = outputSpecifier;
    }

    begin(
        environment: Environment,
        options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }
    ) {
        super.begin(environment, options);

        const move = environment.resolvePath(this.inputSpecifier, null) as Data;
        const to = environment.resolvePath(this.outputSpecifier, `${this.id}_to`);

        environment.updateLayout();

        let end_transform: Transform;

        if (to instanceof Environment) {
            // Then it doesn't have a place yet
            const placeholder = new Data({
                id: `${this.id}_Placeholder`,
                type: DataType.ID,
                value: '_MoveAnimationPlaceholder',
            });
            const placeholderLocation = environment.addDataAt([], placeholder, `${this.id}_PlaceHolder`);

            environment.updateLayout();
            end_transform = { ...placeholder.transform };

            environment.removeAt(placeholderLocation);
        } else {
            end_transform = { ...to.transform };
        }

        // Start position
        const start_transform = { ...move.transform };

        // Create a movement path to translate the floating container along
        const path = new DataMovementPath(start_transform, end_transform);
        path.seek(0);

        environment._temps['path'] = path;

        if (options.baking) {
            this.computeReadAndWrites({ location: environment.getMemoryLocation(move).foundLocation, id: move.id });
        }
    }

    seek(environment: Environment, time: number) {
        let t = super.ease(time / this.duration);

        const path = environment._temps['path'];

        path.seek(t);
        const position = path.getPosition(t);

        let move = environment.resolvePath(this.inputSpecifier, null) as Data;

        move.transform.x = position.x;
        move.transform.y = position.y;
    }

    end(environment: Environment, options: AnimationGraphRuntimeOptions = { indent: 0, baking: false, globalTime: 0 }) {
        this.seek(environment, this.duration);
        environment._temps['path']?.destroy();
    }

    computeReadAndWrites(data: AnimationData) {
        this._reads = [data];
        this._writes = [data];
    }
}
