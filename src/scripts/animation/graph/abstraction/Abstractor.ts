// import { Executor } from '../../../executor/Executor';
// import { View } from '../../../view/ViewRenderer';
// import { computeAllGraphEdges, computeParentIds, logAnimation } from '../../animation';
// import { AnimationGraph } from '../AnimationGraph';
// import { applyAggregation } from './Aggregation';
// import { applyAnnotation } from './Annotation';
// import { applyLayout } from './Layout';
// import { applyTransition } from './Transition';

import { currentAbstraction } from '../../animation'
import { AnimationNode, instanceOfAnimationNode } from '../../primitive/AnimationNode'
import { AnimationGraph } from '../AnimationGraph'
import { applyTransition } from './Transition'

export enum AbstractionType {
    Unknown = 'Unknown',
    None = 'None',
    Aggregation = 'Aggregation',
    Transition = 'Transition',
    Annotation = 'Annotation',
    Layout = 'Layout',
}

export interface AbstractionSpec {
    type: AbstractionType
    value: any
}

export enum AbstractionSelectionType {
    Unknown = 'Unknown',
    ChunkLine = 'ChunkLine',
    Manual = 'Manual',
}

export interface AbstractionSelection {
    type: AbstractionSelectionType
    value?: any
}

export interface AbstractOptions {
    selection: AbstractionSelection
    spec: AbstractionSpec
}

// A chunk is a list of consecutive animation nodes
export interface AnimationChunk {
    parent: AnimationGraph
    nodes: (AnimationNode | AnimationGraph)[]
}

/**
 * In place abstraction of animation
 * @param animation
 * @param options
 */
export function abstract(parent: AnimationGraph, options: AbstractOptions = null) {
    if (options == null) {
        options = {
            selection: { type: AbstractionSelectionType.ChunkLine },
            spec: { type: AbstractionType.Transition, value: null },
        }
    }

    // 1. Get all the chunks
    const chunks =
        options.selection.type == AbstractionSelectionType.Manual
            ? (options.selection.value as AnimationChunk[])
            : getAnimationChunks(parent, options.selection)

    console.log('Chunks', chunks)

    // 2. Abstract each chunk
    for (const chunk of chunks) {
        applyAbstraction(chunk, options)
    }
}

/**
 * TODO consider selection
 * @param animation
 * @param selection
 * @returns
 */
export function getAnimationChunks(parent: AnimationGraph, selection: AbstractionSelection): AnimationChunk[] {
    const vertices = currentAbstraction(parent).vertices
    const chunks: AnimationChunk[] = [{ nodes: [], parent }]

    let line = null

    for (const vertex of vertices) {
        const delta = vertex.nodeData.location.start.line - line

        // Create a new chunk
        if (delta > 1) {
            chunks.push({ nodes: [], parent })
        }

        line = vertex.nodeData.location.start.line

        chunks[chunks.length - 1].nodes.push(vertex)
    }

    if (chunks.length == 1) {
        const childrenChunks: AnimationChunk[] = []

        // Then there was no chunking actually performed
        for (const child of vertices) {
            if (instanceOfAnimationNode(child)) continue

            const childChunks = getAnimationChunks(child, selection)
            childrenChunks.push(...childChunks)
        }

        return childrenChunks.length == 0 ? chunks : childrenChunks
    }

    return chunks
}

export function applyAbstraction(chunk: AnimationChunk, spec: AbstractOptions) {
    switch (spec.spec.type) {
        // case AbstractionType.Aggregation:
        //     applyAggregation(animation, spec);
        //     break;
        case AbstractionType.Transition:
            applyTransition(chunk, spec)
            break
        // case AbstractionType.Annotation:
        //     applyAnnotation(animation, spec);
        //     break;
        // case AbstractionType.Layout:
        //     applyLayout(animation, spec);
        //     break;
        default:
            throw new Error(`Unsupported abstraction type: ${spec.spec.type}`)
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
