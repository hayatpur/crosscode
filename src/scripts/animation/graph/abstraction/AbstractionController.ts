import { logAnimation } from "../../../utilities/graph";
import { View } from "../../../view/View";
import { AnimationGraph } from "../AnimationGraph";
import { applyAggregation } from "./Aggregation";
import { applyAnnotation } from "./Annotation";
import { applyLayout } from "./Layout";
import { applyTransition } from "./Transition";

export enum AbstractionType {
  Aggregation = "Aggregation",
  Transition = "Transition",
  Annotation = "Annotation",
  Layout = "Layout",
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

export function applyAbstraction(
  animation: AnimationGraph,
  spec: AbstractionSpec
) {
  console.log("Before", logAnimation(animation));

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

  console.log("After", logAnimation(animation));

  View.views[animation.id].update();
  View.views[animation.id].reset();

  // Bake views
  animation.seek([animation.precondition.copy()], animation.duration, {
    baking: true,
    indent: 0,
  });
  animation.reset({ baking: true });
  // Executor.instance.time = 0;
}
