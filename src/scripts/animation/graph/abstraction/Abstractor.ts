// import { Executor } from '../../../executor/Executor';
// import { View } from '../../../view/ViewRenderer';
// import { computeAllGraphEdges, computeParentIds, logAnimation } from '../../animation';
// import { AnimationGraph } from '../AnimationGraph';
// import { applyAggregation } from './Aggregation';
// import { applyAnnotation } from './Annotation';
// import { applyLayout } from './Layout';
// import { applyTransition } from './Transition';

import { AnimationNode } from '../../primitive/AnimationNode';
import { AnimationGraph, instanceOfAnimationGraph } from '../AnimationGraph';
import { applyTransition } from './Transition';

export enum AbstractionType {
    None = 'None',
    Aggregation = 'Aggregation',
    Transition = 'Transition',
    Annotation = 'Annotation',
    Layout = 'Layout',
}

export interface AbstractionSpec {
    type: AbstractionType;
    value: any;
}

export interface AbstractOptions {
    query?: (animation: AnimationGraph | AnimationNode) => boolean;
    spec: AbstractionSpec;
}

/**
 * In place abstraction of animation
 * @param animation
 * @param options
 */
export function abstract(
    animation: AnimationGraph | AnimationNode,
    options: AbstractOptions = null
) {
    if (options == null) {
        options = {
            query: (animation: AnimationGraph | AnimationNode) =>
                animation.nodeData.type == 'AnimationGroup' && animation.id != 'AG(2)',
            spec: { type: AbstractionType.Transition, value: null },
        };
    }

    if (options.query(animation)) {
        applyAbstraction(animation, options.spec);
    } else {
        if (instanceOfAnimationGraph(animation)) {
            const { vertices } = animation.abstractions[animation.currentAbstractionIndex];
            vertices.forEach((v) => abstract(v, options));
        } else {
            // abstract(animation, options);
        }
    }
}

export function applyAbstraction(animation: AnimationGraph | AnimationNode, spec: AbstractionSpec) {
    switch (spec.type) {
        // case AbstractionType.Aggregation:
        //     applyAggregation(animation, spec);
        //     break;
        case AbstractionType.Transition:
            applyTransition(animation, spec);
            break;
        // case AbstractionType.Annotation:
        //     applyAnnotation(animation, spec);
        //     break;
        // case AbstractionType.Layout:
        //     applyLayout(animation, spec);
        //     break;
        default:
            throw new Error(`Unsupported abstraction type: ${spec.type}`);
    }

    // View.views[animation.id].update();

    // Bake views
    // animation.seek([animation.precondition.copy()], animation.duration, {
    //     baking: true,
    //     indent: 0,
    // });
    // animation.reset({ baking: true });

    // Bake views
    // animation.reset();
    // animation.seek([animation.precondition.copy()], animation.duration, {
    //     baking: true,
    //     indent: 0,
    //     globalTime: 0,
    // });
    // animation.reset({ baking: true, globalTime: 0, indent: 0 });

    // computeParentIds(animation);
    // computeAllGraphEdges(animation);

    // // View.views[animation.id].destroy();
    // Executor.instance.view.destroy();
    // Executor.instance.view = new View(Executor.instance.animation);

    // console.log('After', logAnimation(animation));

    // Executor.instance.time = 0;
}
