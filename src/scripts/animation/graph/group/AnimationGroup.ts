import { Node } from '../../../transpiler/Node';
import { AnimationGraph } from '../AnimationGraph';

export class AnimationGroup extends AnimationGraph {
    constructor(node: Node) {
        super(node);
    }

    getName() {
        return 'Animation Group';
    }
}
