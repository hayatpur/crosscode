import { clone } from '../../../utilities/objects';
import { AnimationNode, instanceOfAnimationNode } from '../../primitive/AnimationNode';
import { AnimationGraph } from '../AnimationGraph';
import { AbstractionSpec } from './Abstractor';

// export interface Trace {
//     operation: TraceOperation;
//     value: any;
//     location: any;
// }

// export enum TraceOperation {
//     Move = 'Move',
//     Combine = 'Add',
//     NoChangeMove = 'NoChangeMove',
// }

export function applyTransition(animation: AnimationGraph | AnimationNode, config: AbstractionSpec) {
    // const dependencies = ...
    // ^ based on that provide a transition

    if (instanceOfAnimationNode(animation)) {
        return;
    }

    const startState = clone(animation.precondition);
    const endState = clone(animation.postcondition);

    console.log(animation, startState, endState);

    // const traces: { [dataId: string]: Trace[][] } = {};

    // // Add all potential traces
    // const memory = endState.flattenedMemory().filter((data) => data && data.type == DataType.Literal);
    // for (const data of memory) {
    //     traces[data.id] = [];

    //     const trace = findDataTrace(data, animation);

    //     while (trace != null) {
    //         traces[data.id].push(trace);
    //     }

    //     if (traces[data.id].length == 0) {
    //         traces[data.id] = [[{ operation: TraceOperation.NoChangeMove, value: data.id, location: null }]];
    //     }
    // }

    // const reads = animation.reads();
    // const writes = animation.writes();

    // animation.vertices = [];
    // animation.edges = [];

    // const transition = new TransitionAnimation(startState, endState, traces, true);
    // transition.parentIds = new Set(animation.parentIds);
    // transition._reads = reads;
    // transition._writes = writes;

    // addVertex(animation, transition, animation.node);
    // animation.showing = true;
}

// export function findDataTrace(data: Data, animation: AnimationGraph): Trace[] {
//     let trace = null;

//     logAnimation(animation);

//     return trace;
// }
