import { Accessor, PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { ExecutionNode, NodeData } from '../primitive/ExecutionNode'
import { Edge } from './edges/Edge'
import { getEmptyNodeData } from './graph'

export interface ExecutionRuntimeOptions {
    indent?: number
}

export interface DataInfo {
    location: Accessor[]
    id: string
}

export interface ExecutionGraphPath {
    node: ExecutionGraph | ExecutionNode
    edge?: Edge
}

export interface ExecutionGraph {
    // Meta info
    _type: 'ExecutionGraph'
    id: string
    nodeData: NodeData

    // General info
    precondition: PrototypicalEnvironmentState
    postcondition: PrototypicalEnvironmentState
    isGroup: boolean

    // Animation info
    vertices: (ExecutionGraph | ExecutionNode)[]
    edges: Edge[]
    isParallel: boolean
    parallelStarts: number[]
}

export function instanceOfExecutionGraph(animation: any): animation is ExecutionGraph {
    return animation._type == 'ExecutionGraph'
}

export function createExecutionGraph(
    nodeData: NodeData,
    options: { isGroup?: boolean } = {}
): ExecutionGraph {
    if (this.id == undefined) this.id = 0

    return {
        // Meta info
        _type: 'ExecutionGraph',
        id: `AG(${++this.id})`,
        nodeData: options.isGroup ? getEmptyNodeData(nodeData) : nodeData,

        // Invariant to abstraction info
        precondition: null,
        postcondition: null,
        isGroup: options.isGroup || false,

        vertices: [],
        edges: [],
        isParallel: false,
        parallelStarts: [],
    }
}
