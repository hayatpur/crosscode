import { Data } from '../../../environment/Data';
import { logAnimation } from '../../../utilities/graph';
import { AnimationNode } from '../../primitive/AnimationNode';
import { TransitionAnimation } from '../../primitive/Generic/TransitionAnimation';
import { AnimationGraph } from '../AnimationGraph';
import { AbstractionSpec } from './AbstractionController';

export enum TraceOperation {
    Move = 'Move',
    Combine = 'Add',
}

export interface Trace {
    operation: TraceOperation;
    value: any;
    location: any;
}

export function applyTransition(animation: AnimationGraph | AnimationNode, config: AbstractionSpec) {
    // const dependencies = ...
    // ^ based on that provide a transition

    if (animation instanceof AnimationNode) {
        return;
    }

    const startState = animation.precondition.copy();
    const endState = animation.postcondition.copy();

    const traces: { [dataId: string]: Trace[][] } = {};

    // Add all potential traces
    for (const data of endState.flattenedMemory()) {
        traces[data.id] = [];

        const trace = findDataTrace(data, animation);

        while (trace != null) {
            traces[data.id].push(trace);
        }
    }

    const reads = animation.reads();
    const writes = animation.writes();

    animation.vertices = [];
    animation.edges = [];

    const transition = new TransitionAnimation(startState, endState, traces, true);
    transition.parentIds = new Set(animation.parentIds);
    transition._reads = reads;
    transition._writes = writes;

    animation.addVertex(transition, animation.node);
    animation.showing = true;
}

export function findDataTrace(data: Data, animation: AnimationGraph): Trace[] {
    let trace = [];

    logAnimation(animation);

    return trace;
}
