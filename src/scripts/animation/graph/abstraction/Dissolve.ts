import { dissolve } from '../../../utilities/graph';
import { collapseAnimation } from '../../../utilities/graph-simplification';
import { AnimationNode } from '../../primitive/AnimationNode';
import { AnimationGraph } from '../AnimationGraph';

export interface DissolveConfig {
    shouldDissolve: true;
}

export function applyDissolve(animation: AnimationGraph | AnimationNode, config: DissolveConfig) {
    if (animation instanceof AnimationNode) return;
    dissolve(animation);
    collapseAnimation(animation);
}
