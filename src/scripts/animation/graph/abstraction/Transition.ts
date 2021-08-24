import { AccessorType } from "../../../environment/Data";
import {
  dissolve,
  getIncomingFlow,
  logAnimation,
} from "../../../utilities/graph";
import { View } from "../../../view/View";
import { ViewRenderer } from "../../../view/ViewRenderer";
import { AnimationNode } from "../../primitive/AnimationNode";
import { AnimationData, AnimationGraph } from "../AnimationGraph";
import { AbstractionSpec } from "./AbstractionController";

export function applyTransition(
  animation: AnimationGraph | AnimationNode,
  config: AbstractionSpec
) {
  // const dependencies = ...
  // ^ based on that provide a transition

  if (animation instanceof AnimationNode) {
    return;
  }

  const startState = animation.precondition.copy();
  const endState = animation.postcondition.copy();

  const trace = [];

  animation.vertices = [];
  animation.edges = [];

  animation.addVertex(
    new TransitionAnimation(startState, endState, { showStart: false })
  );

  startState.log();
  endState.log();

  // dissolve(animation);

  // Find all writes (includes temporary values)
  let writes: AnimationData[] = [];
  for (const vertex of animation.vertices) {
    for (const write of vertex.writes()) {
      if (writes.some((other) => other.id == write.id)) continue;
      writes.push(write);
    }
  }

  // Filter out writes that are temporary (i.e. not in the endState)
  console.log(JSON.parse(JSON.stringify(writes)));
  writes = writes.filter((write) => {
    const value = endState.resolve({ type: AccessorType.ID, value: write.id });
    return value != null;
  });
  console.log(writes);

  // Find trace of all the writes

  // let reads = [];
}

export function showBefore(view: View) {
  view.beforeRenderer = new ViewRenderer();
  view.preChildrenContainer.append(view.beforeRenderer.element);
  view.animation.precondition.copy();
}
