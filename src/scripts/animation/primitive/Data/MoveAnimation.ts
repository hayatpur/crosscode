import { Accessor, Data, DataType, Transform } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { DataMovementPath } from '../../../utilities/DataMovementPath';
import { AnimationData } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class MoveAnimation extends AnimationNode {
    inputSpecifier: Accessor[];
    outputSpecifier: Accessor[];

    constructor(inputSpecifier: Accessor[], outputSpecifier: Accessor[], options: AnimationOptions = {}) {
        super({ ...options, duration: 80 });

        this.inputSpecifier = inputSpecifier;
        this.outputSpecifier = outputSpecifier;
    }

    begin(environment: Environment, options = { baking: false }) {
        super.begin(environment, options);

        const move = environment.resolvePath(this.inputSpecifier) as Data;
        const to = environment.resolvePath(this.outputSpecifier);

        environment.updateLayout();

        let end_transform: Transform;

        if (to instanceof Environment) {
            // Then it doesn't have a place yet
            const placeholder = new Data({ type: DataType.ID, value: '_MoveAnimationPlaceholder' });
            const placeholderLocation = environment.addDataAt([], placeholder);

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

        let move = environment.resolvePath(this.inputSpecifier) as Data;

        move.transform.x = position.x;
        move.transform.y = position.y;
    }

    end(environment: Environment, options = { baking: false }) {
        this.seek(environment, this.duration);
        environment._temps['path']?.destroy();
    }

    computeReadAndWrites(data: AnimationData) {
        this._reads = [data];
        this._writes = [data];
    }
}
