import { Accessor, AccessorType, Data, DataType, Transform } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { DataMovementPath } from '../../../utilities/DataMovementPath';
import { remap } from '../../../utilities/math';
import { AnimationData } from '../../graph/AnimationGraph';
import { AnimationNode, AnimationOptions } from '../AnimationNode';

export default class MoveAndPlaceAnimation extends AnimationNode {
    inputSpecifier: Accessor[];
    outputSpecifier: Accessor[];

    constructor(inputSpecifier: Accessor[], outputSpecifier: Accessor[], options: AnimationOptions = {}) {
        super({ ...options, duration: 100 });

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
    }

    seek(environment: Environment, time: number) {
        let move = environment.resolvePath(this.inputSpecifier) as Data;

        // Move
        if (time <= 80) {
            let t = super.ease(remap(time, 0, 80, 0, 1));

            const path = environment._temps['path'];
            path.seek(t);

            const position = path.getPosition(t);
            move.transform.x = position.x;
            move.transform.y = position.y;
        }
        // Place
        else {
            let t = super.ease(remap(time, 80, 100, 0, 1));
            move.transform.z = 1 - t;
        }
    }

    end(environment: Environment, options = { baking: false }) {
        this.seek(environment, this.duration);
        environment._temps['path']?.destroy();

        const input = environment.resolvePath(this.inputSpecifier) as Data;
        const to = environment.resolvePath(this.outputSpecifier) as Data;

        if (options.baking) {
            this.computeReadAndWrites(
                { location: environment.getMemoryLocation(input).foundLocation, id: input.id },
                { location: environment.getMemoryLocation(to).foundLocation, id: to.id }
            );
        }

        if (to instanceof Environment) {
            environment.removeAt(environment.getMemoryLocation(input).foundLocation);
        } else {
            // Remove the copy
            environment.removeAt(environment.getMemoryLocation(input).foundLocation);
            to.replaceWith(input, { frame: true });
        }

        input.transform.floating = false;
        input.transform.z = 0;

        // Put it in the floating stack
        const FloatingStack = environment.resolvePath([{ type: AccessorType.Symbol, value: '_FloatingStack' }], {
            noResolvingId: true,
        }) as Data;

        (FloatingStack.value as Data[]).pop();
    }

    computeReadAndWrites(inputData: AnimationData, outputData: AnimationData) {
        this._reads = [inputData];
        this._writes = [inputData, outputData];
    }
}
