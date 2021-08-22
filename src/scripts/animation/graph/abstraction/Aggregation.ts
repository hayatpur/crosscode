import { dissolve } from '../../../utilities/graph';
import {
    collapseAnimation,
    findMovementsInSubgraph,
    simplifyType1Movement,
} from '../../../utilities/graph-simplification';
import { AnimationNode } from '../../primitive/AnimationNode';
import { AnimationGraph, AnimationGroup } from '../AnimationGraph';
import { AggregateConfig } from './AbstractionController';

export function applyAggregation(animation: AnimationGraph | AnimationNode, config: AggregateConfig) {
    if (animation instanceof AnimationNode) return;

    let children = animation.vertices;

    if (animation instanceof AnimationGroup && config.Children) {
        children = (animation.vertices[0] as AnimationGroup).vertices;
    }

    // Simplify all children
    for (let i = children.length - 1; i >= 0; i--) {
        applyAggregation(children[i], { ...config, Depth: config.Depth + 1, Children: false });
    }

    if (config.Children) {
        return;
    }

    dissolve(animation);

    while (true && config.Depth >= 0) {
        const movements = findMovementsInSubgraph(animation);
        if (movements.type1.length == 0) break;
        simplifyType1Movement(animation, movements.type1[0]);
    }

    collapseAnimation(animation);

    // while (true) {
    //     const movements = findMovementsInSubgraph(animation);
    //     if (movements.direct.length == 0) break;
    //     simplifyDirectMovement(animation, movements.direct[0]);
    // }

    // collapseAnimation(animation);
}
