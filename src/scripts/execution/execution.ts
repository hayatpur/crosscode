import { EnvironmentState } from '../environment/EnvironmentState'
import { clone } from '../utilities/objects'
import { Edge } from './graph/edges/Edge'
import { DataInfo, ExecutionGraph } from './graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode } from './primitive/ExecutionNode'

/**
 * Removes an edge from an animation graph. Warns if edge was not found in the animation graph.
 * @param graph - Animation graph to remove edge from
 * @param edge - Edge to remove
 */
export function removeEdge(graph: ExecutionGraph, edge: Edge) {
    const index = graph.edges.findIndex((e) => e.id == edge.id)
    if (index == -1) {
        console.warn('Attempting to remove non-existent edge', edge)
        return
    }

    graph.edges.splice(index, 1)
}

/**
 * Add an edge to animation graph if it does not already exist.
 * @param graph - Animation graph to add edge to
 * @param edge - Edge to add
 */
export function addEdge(graph: ExecutionGraph, edge: Edge) {
    for (const other of graph.edges) {
        if (
            other.from == edge.from &&
            other.to == edge.to &&
            other.constructor.name == edge.constructor.name
        ) {
            return
        }
    }

    graph.edges.push(edge)
}

export function applyExecutionNode(execution: ExecutionNode, environment: EnvironmentState) {
    execution.precondition = clone(environment)
    execution.apply(execution, environment)
    execution.postcondition = clone(environment)
}

export function reads(animation: ExecutionGraph | ExecutionNode): DataInfo[] {
    if (instanceOfExecutionNode(animation)) {
        if (animation._reads == null) {
            console.error('Animation reads not set for', animation)
        }
        return animation._reads
    }

    let result = []
    const { vertices } = animation

    for (const vertex of vertices) {
        result.push(...reads(vertex))
    }

    return result
}

export function writes(animation: ExecutionGraph | ExecutionNode): DataInfo[] {
    if (instanceOfExecutionNode(animation)) {
        return animation._writes
    }

    let result = []
    const { vertices } = animation

    for (const vertex of vertices) {
        result.push(...writes(vertex))
    }

    return result
}
