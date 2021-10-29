import { getDiff } from 'recursive-diff';
import { DataType } from '../../../environment/data/DataState';
import { clone } from '../../../utilities/objects';
import { getCurrentEnvironment } from '../../../view/view';
import { AnimationNode, instanceOfAnimationNode } from '../../primitive/AnimationNode';
import { AnimationGraph } from '../AnimationGraph';
import { DataTraceChains, getTrace } from '../graph';
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

export function applyTransition(
    animation: AnimationGraph | AnimationNode,
    config: AbstractionSpec
) {
    // const dependencies = ...
    // ^ based on that provide a transition

    if (instanceOfAnimationNode(animation)) {
        return;
    }

    let startEnv = clone(getCurrentEnvironment(animation.precondition));
    let endEnv = clone(getCurrentEnvironment(animation.postcondition));

    let delta = getDiff(startEnv, endEnv);
    delta = delta.filter((diff) => diff.path.indexOf('transform') === -1);

    console.log('Delta', startEnv, endEnv);

    const startTrace: DataTraceChains[] = [];

    // Only render literals and arrays
    const endMemory = endEnv.memory
        .filter((m) => m != null)
        .filter((data) => data.type == DataType.Literal || data.type == DataType.Array);

    endMemory.forEach((d) => startTrace.push({ id: d.id, trace: [] }));

    const trace = getTrace(animation, startTrace);

    // Concatenate the trace to start & end transition (if no trace => creation)
    for (const chain of trace) {
        if (chain.trace.length > 0) {
            chain.trace = [chain.trace[chain.trace.length - 1]];
        }
    }

    // TODO Find unused traces => deletions
    // const startMemory = startEnv.memory
    //     .filter((m) => m != null)
    //     .filter((data) => data.type == DataType.Literal || data.type == DataType.Array);
    // startMemory.forEach((d) => startTrace.push({ id: d.id, trace: [] }));

    console.log('Final trace', trace);

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
