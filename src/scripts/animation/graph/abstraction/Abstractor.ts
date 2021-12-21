// import { Executor } from '../../../executor/Executor';
// import { View } from '../../../view/ViewRenderer';
// import { computeAllGraphEdges, computeParentIds, logAnimation } from '../../animation';
// import { AnimationGraph } from '../AnimationGraph';
// import { applyAggregation } from './Aggregation';
// import { applyAnnotation } from './Annotation';
// import { applyLayout } from './Layout';
// import { applyTransition } from './Transition';

import { currentAbstraction } from '../../animation'
import {
    AnimationNode,
    ChunkNodeData,
    instanceOfAnimationNode,
} from '../../primitive/AnimationNode'
import { AnimationGraph, instanceOfAnimationGraph } from '../AnimationGraph'

export type AbstractionSelectionChunk = string[]

export interface AbstractionSelectionSingular {
    id: string
    selection: AbstractionSelection
}

export function instanceOfAbstractionSelectionSingular(
    selection: any
): selection is AbstractionSelectionSingular {
    return 'id' in selection && 'selection' in selection
}

export type AbstractionSelection = (
    | AbstractionSelectionSingular
    | AbstractionSelectionChunk
)[]

export interface AbstractOptions {
    selection: AbstractionSelection
}

// A chunk is a list of consecutive animation nodes
export interface AnimationChunk {
    parent: AnimationGraph
    nodes: (AnimationNode | AnimationGraph)[]
}

/**
 * TODO consider selection
 * @param animation
 * @param selection
 * @returns
 */
export function getAnimationChunks(
    parent: AnimationGraph,
    selection: AbstractOptions
): AnimationChunk[] {
    const vertices = parent.abstractions[0].vertices
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

    // If there was no chunking actually performed
    if (chunks.length == 1) {
        const childrenChunks: AnimationChunk[] = []

        for (const child of vertices) {
            if (instanceOfAnimationNode(child)) continue

            const childChunks = getAnimationChunks(child, selection)
            childrenChunks.push(...childChunks)
        }

        return childrenChunks.length == 0 ? chunks : childrenChunks
    }

    return chunks
}

export function generateCurrentSelection(
    parent: AnimationGraph | AnimationNode
): AbstractionSelection {
    if (instanceOfAnimationNode(parent)) {
        return null
    }

    const selection = []
    const vertices = currentAbstraction(parent).vertices

    for (let i = 0; i < vertices.length; i++) {
        if (vertices[i].isChunk) {
            const nodeData = vertices[i].nodeData as ChunkNodeData
            selection.push(nodeData.selection)
        } else {
            selection.push({
                id: vertices[i].id,
                selection: generateCurrentSelection(vertices[i]),
            })
        }
    }

    return selection
}
