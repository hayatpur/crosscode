import { Accessor, Data } from '../../../environment/Data';
import { Environment } from '../../../environment/Environment';
import { AnimationNode } from '../AnimationNode';
import { DataMovementPath } from '../DataMovementPath';

export default class MoveAnimation extends AnimationNode {
    inputSpecifier: Accessor[];
    outputSpecifier: Accessor[];

    constructor(inputSpecifier: Accessor[], outputSpecifier: Accessor[]) {
        super({ duration: 80 });

        this.inputSpecifier = inputSpecifier;
        this.outputSpecifier = outputSpecifier;
    }

    begin(environment: Environment) {
        const move = environment.resolvePath(this.inputSpecifier) as Data;
        const to = environment.resolvePath(this.outputSpecifier) as Data;

        // TODO: If destination is the same as the current location

        // End position
        const end_transform = { ...to.transform };

        // Start position
        const start_transform = { ...move.transform };

        // Create a movement path to translate the floating container along
        environment.updateLayout();
        const path = new DataMovementPath(start_transform, end_transform);
        path.seek(0);

        environment._temps['path'] = path;
    }

    seek(environment: Environment, time: number) {
        let t = this.ease(time / this.duration);

        const path = environment._temps['path'];

        path.seek(t);
        const position = path.getPosition(t);

        const move = environment.resolvePath(this.inputSpecifier) as Data;

        move.transform.x = position.x;
        move.transform.y = position.y;
    }

    end(environment: Environment) {
        this.seek(environment, this.duration);
        environment._temps['path']?.destroy();
    }
}
