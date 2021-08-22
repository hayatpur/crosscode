import { View } from '../../../view/View';
import { AnimationGraph } from '../AnimationGraph';
import { applyAggregation } from './Aggregation';

export enum AggregateOptimizerGoal {
    Default = 'Default',
    Order = 'Order',
}

export interface AggregateConfig {
    Depth: number;
    Goal?: AggregateOptimizerGoal;
    Children?: boolean;
}

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

export function applyAbstractions(animation: AnimationGraph, spec: AbstractionSpec) {
    switch (spec.type) {
        case AbstractionType.Aggregation:
            applyAggregation(animation, spec.value);
            break;
        case AbstractionType.Transition:
            applyTransition(animation, spec.value);
            break;
        case AbstractionType.Annotation:
            applyAnnotation(animation, spec.value);
            break;
        case AbstractionType.Layout:
            applyLayout(animation, spec.value);
            break;
        default:
            throw new Error(`Unsupported abstraction type: ${spec.type}`);
    }

    View.views[animation.id].update();

    animation.view.reset();

    // Bake views
    animation.seek([animation.precondition.copy()], animation.duration, {
        baking: true,
        indent: 0,
    });
    animation.reset({ baking: true });
    // Executor.instance.time = 0;
}
