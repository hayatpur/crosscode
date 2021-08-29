import { Environment } from '../../../environment/Environment';
import { Executor } from '../../../executor/Executor';
import { computeAllGraphEdges, computeParentIds, logAnimation } from '../../../utilities/graph';
import { View } from '../../../view/View';
import { AnimationGraph } from '../AnimationGraph';
import { applyAggregation } from './Aggregation';
import { applyAnnotation } from './Annotation';
import { applyLayout } from './Layout';
import { applyTransition } from './Transition';

export enum AbstractionType {
    Aggregation = 'Aggregation',
    Transition = 'Transition',
    Annotation = 'Annotation',
    Layout = 'Layout',
}

export interface AbstractionSpec {
    type: AbstractionType;
    value: any;
}

// Bubble-sort:
// Maybe it's hard to move from low-level to high-level.
// Easier to see the high-level first, and then move to the low-level.
// Or, connection between animation and code is not very strong

// Do you see visual feedback on if you're moving down?
// These visual feedbacks are important during
// "orient" user

// Gradually dictate animations they want to see. Combine them, let user combine them in a way that fits their workflow.

export function applyAbstraction(animation: AnimationGraph, spec: AbstractionSpec) {
    console.log('Before', logAnimation(animation));

    switch (spec.type) {
        case AbstractionType.Aggregation:
            applyAggregation(animation, spec);
            break;
        case AbstractionType.Transition:
            applyTransition(animation, spec);
            break;
        case AbstractionType.Annotation:
            applyAnnotation(animation, spec);
            break;
        case AbstractionType.Layout:
            applyLayout(animation, spec);
            break;
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
    animation.reset();
    animation.seek([new Environment()], animation.duration, {
        baking: true,
        indent: 0,
        globalTime: 0,
    });
    animation.reset({ baking: true, globalTime: 0, indent: 0 });

    computeParentIds(animation);
    computeAllGraphEdges(animation);

    // View.views[animation.id].destroy();
    Executor.instance.view.destroy();
    Executor.instance.view = new View(Executor.instance.animation);

    console.log('After', logAnimation(animation));

    // Executor.instance.time = 0;
}
